from src.core.repository.base import BaseRepository
from src.models.models import Organization


class OrganizationRepository(BaseRepository[Organization]):
    def get_by_slug(self, slug: str):
        return self.get_by("slug", slug, unique=True)
