import re
import unicodedata
from uuid import UUID

from src.core.repository.base import BaseRepository
from src.models.models import KnowledgeBase


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
