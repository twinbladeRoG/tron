import re
import unicodedata
from typing import Optional
from uuid import UUID

from sqlmodel import select

from src.core.exception import NotFoundException
from src.core.repository.base import BaseRepository
from src.models.enums import FileProcessingStatus, KnowledgeBaseStatus
from src.models.models import File, FileKnowledgeBaseLink, KnowledgeBase


class KnowledgeBaseRepository(BaseRepository[KnowledgeBase]):
    def get_user_knowledge_base_by_id(self, id: UUID, user_id: UUID):
        base_statement = self._query().where(
            KnowledgeBase.id == id, KnowledgeBase.owner_id == user_id
        )
        return self.session.exec(base_statement).one_or_none()

    def get_knowledge_base_by_id(self, id: UUID):
        return self.get_by("id", id, unique=True)

    @staticmethod
    def _generate_slug(name: str):
        value = unicodedata.normalize("NFKD", name)
        value = value.encode("ascii", "ignore").decode("ascii")
        value = re.sub(r"[^\w\s-]", "", value).lower()
        value = re.sub(r"[-\s]+", "-", value).strip("-")
        return value

    def generate_unique_slug(self, name: str):
        base_slug = self._generate_slug(name)
        slug = base_slug
        counter = 1

        while True:
            statement = self._query().where(KnowledgeBase.slug == slug)
            exists = self.session.exec(statement)

            if not exists.first():
                return slug

            slug = f"{base_slug}-{counter}"
            counter += 1

    def get_knowledge_base_by_slug(self, slug: str):
        return self.get_by("slug", slug, unique=True)

    def get_knowledge_base_file_link(self, knowledge_base_id: UUID, file_id: UUID):
        statement = select(FileKnowledgeBaseLink).where(
            FileKnowledgeBaseLink.file_id == file_id,
            FileKnowledgeBaseLink.knowledge_base_id == knowledge_base_id,
        )
        link = self.session.exec(statement).first()
        if not link:
            raise NotFoundException("File in Knowledge Base not found")
        return link

    def change_knowledge_base_file_status(
        self,
        knowledge_base_id: UUID,
        file_id: UUID,
        status: FileProcessingStatus,
        *,
        error: Optional[str] = None,
    ):
        link = self.get_knowledge_base_file_link(knowledge_base_id, file_id)

        link.status = status.value

        if error:
            link.error_message = error

        self.session.add(link)
        self.session.commit()
        self.session.refresh(link)

        return link

    def sync_knowledge_base_status(self, knowledge_base_id: UUID):
        statement = select(FileKnowledgeBaseLink.status).where(
            FileKnowledgeBaseLink.knowledge_base_id == knowledge_base_id
        )
        statuses = list(self.session.exec(statement))

        if not statuses:
            new_status = KnowledgeBaseStatus.PENDING
        elif any(status == FileProcessingStatus.FAILED for status in statuses):
            new_status = KnowledgeBaseStatus.FAILED
        elif all(status == FileProcessingStatus.COMPLETED for status in statuses):
            new_status = KnowledgeBaseStatus.READY
        else:
            new_status = KnowledgeBaseStatus.PROCESSING

        return self.update(knowledge_base_id, {"status": new_status})

    def get_files_with_link(self, id: UUID):
        statement = (
            select(File, FileKnowledgeBaseLink)
            .join(FileKnowledgeBaseLink)
            .where(FileKnowledgeBaseLink.knowledge_base_id == id)
        )
        rows = self.session.exec(statement).all()
        return rows
