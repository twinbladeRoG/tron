from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query

from src.core.dependencies import (
    CurrentUser,
    FileControllerDeps,
    KnowledgeBaseControllerDeps,
)
from src.models.models import File, KnowledgeBase
from src.models.pagination import KnowledgeBasePaginated
from src.models.response import KnowledgeBaseExtended
from src.modules.vector_db.embeddings import EmbeddingModel

from .schema import AddFilesRequest, CreateKnowledgeBaseRequest, PaginatedFilterParams

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
    user: CurrentUser, controller: KnowledgeBaseControllerDeps, identifier: UUID | str
):
    return controller.get_knowledge_base(identifier, user)


@router.delete("/{id}", response_model=KnowledgeBase)
def delete_knowledge_base(
    user: CurrentUser, controller: KnowledgeBaseControllerDeps, id: UUID
):
    return controller.remove_knowledge_base(id, user)


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
