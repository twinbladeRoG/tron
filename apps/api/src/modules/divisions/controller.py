from src.core.controller.base import BaseController
from src.core.repository.base import BaseRepository
from src.models.models import Division


class DivisionController(BaseController[Division]):
    def __init__(self, repository: BaseRepository) -> None:
        super().__init__(model=Division, repository=repository)
        self.repository = repository
