from uuid import UUID

from pydantic import field_validator
from sqlmodel import Field, Relationship

from src.core.security import PasswordHandler
from src.modules.conversation.schema import ConversationBase
from src.modules.llm_models.schema import LlmModelBase
from src.modules.messages.schema import MessageBase
from src.modules.usage_log.schema import ModelUsageLogBase
from src.modules.users.schema import UserBase

from .mixins import BaseModelMixin


class User(BaseModelMixin, UserBase, table=True):
    password: str

    @field_validator("password", mode="after")
    @classmethod
    def generate_hashed_password(cls, value: str) -> str:
        return PasswordHandler.get_password_hash(password=value)

    def __repr__(self) -> str:
        return f"{self.id}: {self.username}, {self.email}"

    usage_logs: list["ModelUsageLog"] = Relationship(back_populates="user")
    conversations: list["Conversation"] = Relationship(back_populates="user")
    messages: list["Message"] = Relationship(back_populates="user")


class LlmModel(BaseModelMixin, LlmModelBase, table=True):
    usage_logs: list["ModelUsageLog"] = Relationship(back_populates="model")


class ModelUsageLog(BaseModelMixin, ModelUsageLogBase, table=True):
    model_id: UUID = Field(foreign_key="llmmodel.id", nullable=False)
    model: LlmModel = Relationship(back_populates="usage_logs")

    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    user: User = Relationship(back_populates="usage_logs")

    conversation_id: UUID = Field(foreign_key="conversation.id", nullable=False)
    conversation: "Conversation" = Relationship(back_populates="usage_logs")


class Conversation(BaseModelMixin, ConversationBase, table=True):
    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    user: User = Relationship(back_populates="conversations")

    usage_logs: list[ModelUsageLog] = Relationship(back_populates="conversation")

    messages: list["Message"] = Relationship(back_populates="conversation")


class Message(BaseModelMixin, MessageBase, table=True):
    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    user: User = Relationship(back_populates="messages")

    conversation_id: UUID = Field(foreign_key="conversation.id", nullable=False)
    conversation: Conversation = Relationship(back_populates="messages")

    model_id: UUID = Field(foreign_key="llmmodel.id", nullable=False)
