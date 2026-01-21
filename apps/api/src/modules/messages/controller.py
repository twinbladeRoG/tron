from uuid import UUID

from src.core.controller.base import BaseController
from src.models.models import Conversation, LlmModel, Message, User

from .repository import MessageRepository
from .schema import CreateMessage, MessageBase


class MessageController(BaseController[Message]):
    def __init__(self, repository: MessageRepository) -> None:
        super().__init__(model=Message, repository=repository)
        self.repository = repository

    def upsert_message(
        self,
        data: MessageBase,
        *,
        user: User,
        conversation: Conversation,
        model: LlmModel,
    ) -> Message:
        return self.repository.add_message(
            CreateMessage(
                **data.model_dump(),
                user_id=user.id,
                conversation_id=conversation.id,
                model_id=model.id,
            )
        )

    def get_message_of_conversation(self, conversation_id: UUID) -> list[Message]:
        query = self.repository._query()
        query.where(self.model_class.conversation_id == conversation_id)
        result = self.repository.session.exec(query)
        return list(result)
