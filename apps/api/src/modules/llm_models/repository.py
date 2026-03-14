from uuid import UUID

from src.core.exception import NotFoundException
from src.core.repository.base import BaseRepository
from src.models.models import LlmModel
from src.utils.parse import is_valid_uuid


class LlmModelRepository(BaseRepository[LlmModel]):
    def get_by_name(self, name: str):
        return self.get_by("name", name, unique=True)

    def get_model(self, identifier: str | UUID):
        if isinstance(identifier, UUID):
            model = self.get_by("id", identifier, unique=True)
        elif isinstance(identifier, str):
            id = is_valid_uuid(identifier)
            if isinstance(id, UUID):
                model = self.get_by("id", identifier, unique=True)
            elif isinstance(id, str):
                model = self.get_by_name(id)
            else:
                raise NotFoundException("Invalid LLM model")
        else:
            raise NotFoundException("Invalid LLM model")

        return model
