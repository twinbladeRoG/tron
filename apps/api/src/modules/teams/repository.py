from src.core.repository.base import BaseRepository
from src.models.models import Team


class TeamRepository(BaseRepository[Team]):
    def get_by_slug(self, slug: str):
        return self.get_by("slug", slug, unique=True)
