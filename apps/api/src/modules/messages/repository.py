from src.core.repository.base import BaseRepository
from src.models.models import Message

from .schema import CreateMessage


class MessageRepository(BaseRepository[Message]):
    def add_message(self, data: CreateMessage):
        return self.create(data.model_dump())
