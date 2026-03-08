from typing import Optional
from uuid import UUID

from aiokafka import AIOKafkaProducer
from qdrant_client import QdrantClient
from sqlalchemy import or_
from sqlmodel import func, select

from src.core.controller.base import BaseController
from src.core.exception import BadRequestException, UnauthorizedException
from src.core.kafka.enums import KafkaTopic
from src.models.enums import FileProcessingStatus, KnowledgeBaseStatus
from src.models.models import File, KnowledgeBase, User
from src.models.pagination import get_pagination
from src.models.response import KnowledgeBaseFileAndLink
from src.modules.vector_db.embeddings import EmbeddingService
from src.modules.vector_db.service import VectorDatabaseService

from .repository import KnowledgeBaseRepository
from .schema import (
    CreateKnowledgeBase,
    CreateKnowledgeBaseRequest,
    ExtractionStatus,
    ExtractPayload,
    PaginatedFilterParams,
)


class KnowledgeBaseController(BaseController[KnowledgeBase]):
    def __init__(
        self,
        repository: KnowledgeBaseRepository,
        vector_db: QdrantClient,
        kafka_producer: AIOKafkaProducer,
    ) -> None:
        super().__init__(model=KnowledgeBase, repository=repository)
        self.repository = repository
        self.vector_service = VectorDatabaseService(vector_db, EmbeddingService())
        self.kafka_producer = kafka_producer

    def get_embedding_models(self):
        return self.vector_service.embedding_service.EMBEDDING_PROVIDERS

    def create_knowledge_base(self, data: CreateKnowledgeBaseRequest, *, user: User):
        slug = self.repository.generate_unique_slug(data.name)
        return self.create(
            CreateKnowledgeBase(
                name=data.name,
                description=data.description,
                slug=slug,
                vector_store_name=slug,
                owner_id=user.id,
            )
        )

    def get_knowledge_base(self, identifier: UUID | str, user: User):
        if isinstance(identifier, UUID):
            knowledge_base = self.repository.get_knowledge_base_by_id(identifier)
        elif isinstance(identifier, str):
            knowledge_base = self.repository.get_knowledge_base_by_slug(identifier)
        else:
            raise BadRequestException("Invalid knowledge base")

        if knowledge_base.owner_id != user.id:
            raise UnauthorizedException(
                "You are not allowed to access this knowledge base."
            )

        return knowledge_base

    def remove_knowledge_base(self, id: UUID, user: User):
        knowledge_base = self.get_knowledge_base(id, user)
        self.repository.delete(knowledge_base)
        self.vector_service.remove_vector_collection(knowledge_base.vector_store_name)
        return knowledge_base

    def get_users_knowledge_bases(self, user_id: UUID, query: PaginatedFilterParams):
        base_statement = self.repository._query().where(
            self.model_class.owner_id == user_id
        )

        if query.search:
            search_term = f"%{query.search.strip()}%"
            base_statement = base_statement.where(
                or_(
                    self.model_class.name.ilike(search_term),  # type: ignore
                    self.model_class.slug.ilike(search_term),  # type: ignore
                )
            )

        base_statement = base_statement.order_by(
            KnowledgeBase.created_at.desc(),  # type: ignore
            KnowledgeBase.id.desc(),  # type: ignore
        )

        statement = base_statement.offset(query.page * query.limit).limit(query.limit)
        results = self.repository.session.exec(statement).all()

        count_statement = (
            select(func.count())
            .select_from(self.model_class)
            .where(self.model_class.owner_id == user_id)
        )

        if query.search:
            search_term = f"%{query.search.strip()}%"
            count_statement = count_statement.where(
                or_(
                    self.model_class.name.ilike(search_term),  # type: ignore
                    self.model_class.slug.ilike(search_term),  # type: ignore
                )
            )

        count = self.repository.session.exec(count_statement).one()

        pagination = get_pagination(query.page, query.limit, count)

        return results, pagination

    def attach_file_to_knowledge_base(self, id: UUID, user: User, files: list[File]):
        knowledge_base = self.get_knowledge_base(id, user)
        file_ids = [file.id for file in files]

        for file in knowledge_base.files:
            if file.id in file_ids:
                raise BadRequestException(
                    f"File {file.original_filename} is already present in knowledge base."
                )

        for file in files:
            knowledge_base.files.append(file)
            self.repository.session.add(knowledge_base)

        if (
            knowledge_base.status != KnowledgeBaseStatus.PENDING.value
            and knowledge_base.status != KnowledgeBaseStatus.PARTIALLY_PROCESSED.value
        ):
            knowledge_base.status = KnowledgeBaseStatus.PARTIALLY_PROCESSED.value

        self.repository.session.commit()

        return self.get_knowledge_base(id, user)

    def detach_file_from_knowledge_base(self, id: UUID, user: User, file: File):
        knowledge_base = self.get_knowledge_base(id, user)
        knowledge_base.files = list(
            filter(lambda f: f.id != file.id, knowledge_base.files)
        )
        self.repository.session.add(knowledge_base)
        self.repository.session.commit()
        self.vector_service.remove_file_from_vector_store(
            knowledge_base.vector_store_name, "file_id", file.id.hex
        )
        return self.get_knowledge_base(id, user)

    def change_status(self, id: UUID, status: KnowledgeBaseStatus):
        knowledge_base = self.get_by_id(id)
        self.repository.update(knowledge_base.id, {"status": status.value})
        return self.get_by_id(id)

    async def enqueue_knowledge_base_for_extraction(self, id: UUID, user: User):
        knowledge_base = self.get_knowledge_base(id, user)

        for file in knowledge_base.files:
            await self.change_knowledge_base_file_status(
                id, file.id, FileProcessingStatus.PENDING
            )

        payload = ExtractPayload(
            knowledge_base_id=knowledge_base.id,
            file_ids=[file.id for file in knowledge_base.files],
        )
        await self.kafka_producer.send_and_wait(
            KafkaTopic.EXTRACT_DOCUMENT.value, value=payload.model_dump(mode="json")
        )
        self.change_status(id, KnowledgeBaseStatus.PROCESSING)

    async def change_knowledge_base_file_status(
        self,
        knowledge_base_id: UUID,
        file_id: UUID,
        status: FileProcessingStatus,
        *,
        error: Optional[str] = None,
    ):
        self.repository.change_knowledge_base_file_status(
            knowledge_base_id, file_id, status, error=error
        )
        await self.kafka_producer.send_and_wait(
            KafkaTopic.EXTRACT_DOCUMENT_STATUS.value,
            ExtractionStatus(
                status=status, file_id=file_id, knowledge_base_id=knowledge_base_id
            ).model_dump(mode="json"),
        )
        self.sync_knowledge_base_status(knowledge_base_id)

    def get_knowledge_base_file_link(self, knowledge_base_id: UUID, file_id: UUID):
        return self.repository.get_knowledge_base_file_link(knowledge_base_id, file_id)

    def sync_knowledge_base_status(self, id: UUID):
        return self.repository.sync_knowledge_base_status(id)

    def get_knowledge_base_files_with_links(self, id: UUID):
        rows = self.repository.get_files_with_link(id)
        result = [
            KnowledgeBaseFileAndLink(**file.model_dump(), link=link)
            for file, link in rows
        ]
        return result
