from uuid import UUID

from src.core.controller.base import BaseController
from src.models.models import Conversation, User

from .repository import ConversationRepository
from .schema import ConversationBase


class ConversationController(BaseController[Conversation]):
    def __init__(self, repository: ConversationRepository) -> None:
        super().__init__(model=Conversation, repository=repository)
        self.repository = repository

    def get_users_conversations(self, user: User):
        return self.repository.get_users_conversations(user.id)

    def get_conversation(self, id: UUID, user: User):
        return self.repository.get_conversation_by_id(id, user.id)

    def create_conversation(self, user: User, data: ConversationBase):
        return self.repository.create_conversation(user.id, data)

    def upsert_conversation(
        self, user: User, data: ConversationBase, *, id: UUID | None = None
    ):
        return self.repository.upsert_conversation(user.id, data, id=id)
