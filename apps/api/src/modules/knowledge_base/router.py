import json
from asyncio import CancelledError
from pprint import pprint
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, WebSocket
from pydantic import ValidationError

from src.core.dependencies import (
    CurrentUser,
    FileControllerDeps,
    KnowledgeBaseControllerDeps,
)
from src.core.kafka.consumer import create_kafka_consumer
from src.core.kafka.enums import KafkaTopic
from src.core.logger import logger
from src.models.enums import KnowledgeBaseStatus
from src.models.models import File, FileKnowledgeBaseLink, KnowledgeBase
from src.models.pagination import KnowledgeBasePaginated
from src.models.response import KnowledgeBaseExtended, KnowledgeBaseFileAndLink
from src.modules.vector_db.embeddings import EmbeddingModel

from .schema import (
    AddFilesRequest,
    CreateKnowledgeBaseRequest,
    ExtractionStatus,
    ExtractSettings,
    PaginatedFilterParams,
)

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])


@router.get("/embedding-providers", response_model=dict[str, list[EmbeddingModel]])
def get_embedding_providers(user: CurrentUser, controller: KnowledgeBaseControllerDeps):
    return controller.get_embedding_models()


@router.get("/", response_model=KnowledgeBasePaginated)
def get_knowledge_bases(
    user: CurrentUser,
    controller: KnowledgeBaseControllerDeps,
    query: Annotated[PaginatedFilterParams, Query()],
):
    knowledge_bases, pagination = controller.get_users_knowledge_bases(user.id, query)
    return KnowledgeBasePaginated(data=list(knowledge_bases), pagination=pagination)


@router.post("/", response_model=KnowledgeBase)
def create_knowledge_base(
    user: CurrentUser,
    controller: KnowledgeBaseControllerDeps,
    body: CreateKnowledgeBaseRequest,
):
    return controller.create_knowledge_base(body, user=user)


@router.get("/{identifier}", response_model=KnowledgeBaseExtended)
def get_knowledge_base(
    user: CurrentUser, controller: KnowledgeBaseControllerDeps, identifier: str
):
    return controller.get_knowledge_base(identifier, user)


@router.delete("/{id}", response_model=KnowledgeBase)
def delete_knowledge_base(
    user: CurrentUser, controller: KnowledgeBaseControllerDeps, id: UUID
):
    return controller.remove_knowledge_base(id, user)


@router.get("/{id}/files", response_model=list[KnowledgeBaseFileAndLink])
def get_knowledge_base_files(
    user: CurrentUser, controller: KnowledgeBaseControllerDeps, id: UUID
):
    knowledge_base = controller.get_knowledge_base(id, user)
    return controller.get_knowledge_base_files_with_links(knowledge_base.id)


@router.patch("/{id}/file", response_model=KnowledgeBase)
def add_file_to_knowledge_base(
    user: CurrentUser,
    controller: KnowledgeBaseControllerDeps,
    id: UUID,
    body: AddFilesRequest,
    file_controller: FileControllerDeps,
):
    files: list[File] = []
    for file_id in body.file_ids:
        file = file_controller.get_user_file_by_id(file_id, user.id)
        files.append(file)

    return controller.attach_file_to_knowledge_base(id, user, files)


@router.delete("/{id}/file/{file_id}", response_model=KnowledgeBase)
def remove_file_from_knowledge_base(
    user: CurrentUser,
    controller: KnowledgeBaseControllerDeps,
    id: UUID,
    file_id: UUID,
    file_controller: FileControllerDeps,
):
    file = file_controller.get_user_file_by_id(file_id, user.id)
    return controller.detach_file_from_knowledge_base(id, user, file)


@router.post("/{id}/train")
async def enqueue_knowledge_base_for_extraction(
    user: CurrentUser,
    controller: KnowledgeBaseControllerDeps,
    id: UUID,
    body: ExtractSettings,
):
    await controller.enqueue_knowledge_base_for_extraction(id, user)
    return None


@router.get("/{id}/file/{file_id}", response_model=FileKnowledgeBaseLink)
def get_knowledge_base_file_link(
    user: CurrentUser,
    id: UUID,
    file_id: UUID,
    controller: KnowledgeBaseControllerDeps,
    file_controller: FileControllerDeps,
):
    knowledge_base = controller.get_knowledge_base(id, user)
    file = file_controller.get_user_file_by_id(file_id, user.id)
    return controller.get_knowledge_base_file_link(knowledge_base.id, file.id)


@router.websocket("/{id}/training-status")
async def knowledge_base_extraction_status(
    websocket: WebSocket,
    id: UUID,
    controller: KnowledgeBaseControllerDeps,
):
    logger.debug(">> Websocket started")
    await websocket.accept()
    logger.debug(">> Websocket started")

    consumer = create_kafka_consumer(
        KafkaTopic.EXTRACT_DOCUMENT_STATUS.value, loop=None
    )

    knowledge_base = controller.get_by_id(id)
    if knowledge_base.status == KnowledgeBaseStatus.READY.value:
        await websocket.close(1000, "Knowledge Base is ready")
    if knowledge_base.status == KnowledgeBaseStatus.FAILED:
        await websocket.close(1000, "Knowledge Base failed")

    try:
        await consumer.start()

        async for message in consumer:
            if message.value is None:
                continue

            try:
                value = json.loads(message.value.decode("utf-8"))
                pprint(value)  # noqa: T203

                status = ExtractionStatus.model_validate(value)
                if status.knowledge_base_id != id:
                    continue

                await websocket.send_json(value)

                knowledge_base = controller.get_by_id(id)

                if knowledge_base.status == KnowledgeBaseStatus.READY.value:
                    await websocket.close(1000, "Knowledge Base is ready")
                if knowledge_base.status == KnowledgeBaseStatus.FAILED:
                    await websocket.close(1000, "Knowledge Base failed")
            except ValidationError as e:
                logger.error(f"Failed to validated message for topic: {message.topic}")
    except CancelledError as e:
        logger.error(f"> Error: {e}")
        await consumer.stop()
    finally:
        await consumer.stop()
