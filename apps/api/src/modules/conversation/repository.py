from uuid import UUID

from src.core.exception import UnauthorizedException
from src.core.repository.base import BaseRepository
from src.models.models import Conversation

from .schema import ConversationBase, CreateConversation


class ConversationRepository(BaseRepository[Conversation]):
    def get_users_conversations(self, user_id: UUID):
        statement = self._query().where(Conversation.user_id == user_id)
        return self.session.exec(statement).all()

    def get_conversation_by_id(self, id: UUID, user_id: UUID):
        conversation = self.get_by("id", id, unique=True)

        if conversation.user_id != user_id:
            raise UnauthorizedException(
                "You are not authorized to update this conversation"
            )

        return conversation

    def create_conversation(self, user_id: UUID, data: ConversationBase):
        payload = CreateConversation(**data.model_dump(), user_id=user_id)
        return self.create(payload.model_dump())

    def update_conversation(self, id: UUID, user_id: UUID, data: ConversationBase):
        self.get_conversation_by_id(id, user_id)

        return self.update(id, data.model_dump())

    def upsert_conversation(
        self, user_id: UUID, data: ConversationBase, *, id: UUID | None = None
    ):
        if id is None:
            return self.create_conversation(user_id, data)

        return self.update_conversation(id, user_id, data=data)
