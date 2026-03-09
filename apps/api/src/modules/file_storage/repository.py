from uuid import UUID

from sqlmodel import select

from src.core.repository.base import BaseRepository
from src.models.models import File, FileKnowledgeBaseLink


class FileRepository(BaseRepository[File]):
    def get_user_file_by_id(self, id: UUID, user_id: UUID):
        base_statement = self._query().where(File.id == id, File.owner_id == user_id)
        return self.session.exec(base_statement).one_or_none()

    def get_file_by_id(self, id: UUID):
        return self.get_by("id", id, unique=True)

    def get_file_by_filename(self, filename: str):
        base_statement = self._query().where(File.filename == filename)
        return self.session.exec(base_statement).one_or_none()

    def mark_file_as_private(self, file_id: UUID):
        file = self.get_file_by_id(file_id)
        return self.update(file.id, {"is_private": True})

    def mark_file_as_public(self, file_id: UUID):
        file = self.get_file_by_id(file_id)
        return self.update(file.id, {"is_private": False})

    def check_if_file_linked_to_knowledge_base(self, file_id: UUID):
        statement = select(FileKnowledgeBaseLink).where(
            FileKnowledgeBaseLink.file_id == file_id
        )
        result = self.session.exec(statement).first()

        if result == None:
            return False
        return True
