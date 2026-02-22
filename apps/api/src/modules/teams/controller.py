from src.core.controller.base import BaseController
from src.core.repository.base import BaseRepository
from src.models.models import Team


class TeamController(BaseController[Team]):
    def __init__(self, repository: BaseRepository) -> None:
        super().__init__(model=Team, repository=repository)
        self.repository = repository
