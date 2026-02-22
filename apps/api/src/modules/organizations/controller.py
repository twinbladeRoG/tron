from src.core.controller.base import BaseController
from src.core.repository.base import BaseRepository
from src.models.models import Organization


class OrganizationController(BaseController[Organization]):
    def __init__(self, repository: BaseRepository) -> None:
        super().__init__(model=Organization, repository=repository)
        self.repository = repository
