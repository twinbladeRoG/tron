from uuid import UUID

from sqlmodel import Session

from src.core.repository.base import BaseRepository
from src.models.models import Message

from .schema import CreateMessage


class MessageRepository(BaseRepository[Message]):
    def __init__(self, model: Message, session: Session) -> None:
        super().__init__(model=Message, session=session)

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
