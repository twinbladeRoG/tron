from uuid import UUID

from src.core.repository.base import BaseRepository
from src.models.models import Message

from .schema import CreateMessage


class MessageRepository(BaseRepository[Message]):
    def add_message(self, data: CreateMessage):
        return self.create(data.model_dump())

    def get_messages_of_conversation(self, conversation_id: UUID) -> list[Message]:
        query = (
            self._query()
            .where(Message.conversation_id == conversation_id.hex)
            .order_by(Message.created_at)  # type: ignore
        )
        result = self.session.exec(query)
        return list(result)

    def get_message_by_run_id(self, run_id: UUID):
        return self.get_by("run_id", run_id, unique=True)
