from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import field_validator
from sqlalchemy import UniqueConstraint
from sqlmodel import Column, Field, Relationship, SQLModel, String

from src.core.security import PasswordHandler
from src.modules.conversation.schema import ConversationBase
from src.modules.divisions.schema import DivisionBase
from src.modules.features.schema import FeatureBase
from src.modules.file_storage.schema import FileBase
from src.modules.knowledge_base.schema import KnowledgeBaseBase
from src.modules.llm_models.schema import LlmModelBase
from src.modules.messages.schema import MessageBase
from src.modules.organizations.schema import OrganizationBase
from src.modules.teams.schema import TeamBase
from src.modules.usage_log.schema import ModelUsageLogBase
from src.modules.users.schema import UserBase
from src.utils.time import utcnow

from .enums import FileProcessingStatus
from .mixins import BaseModelMixin, TimeStampMixin


class UserTeamLink(SQLModel, table=True):
    user_id: UUID = Field(foreign_key="user.id", primary_key=True)
    team_id: UUID = Field(foreign_key="team.id", primary_key=True)

    joined_at: datetime = Field(default_factory=utcnow)


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
    files: list["File"] = Relationship(back_populates="owner")
    knowledge_bases: list["KnowledgeBase"] = Relationship(back_populates="owner")

    organization_id: Optional[UUID] = Field(
        foreign_key="organization.id", nullable=True, index=True
    )
    organization: Optional["Organization"] = Relationship(back_populates="users")

    division_id: Optional[UUID] = Field(
        foreign_key="division.id", nullable=True, index=True
    )
    division: Optional["Division"] = Relationship(back_populates="users")

    teams: list["Team"] = Relationship(
        back_populates="members", link_model=UserTeamLink
    )


class LlmModel(BaseModelMixin, LlmModelBase, table=True):
    usage_logs: list["ModelUsageLog"] = Relationship(back_populates="model")
    messages: list["Message"] = Relationship(back_populates="model")


class ModelUsageLog(BaseModelMixin, ModelUsageLogBase, table=True):
    model_id: UUID = Field(foreign_key="llmmodel.id", nullable=False)
    model: LlmModel = Relationship(back_populates="usage_logs")

    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    user: User = Relationship(back_populates="usage_logs")

    conversation_id: UUID | None = Field(foreign_key="conversation.id", nullable=True)
    conversation: "Conversation" = Relationship(back_populates="usage_logs")

    message_id: UUID | None = Field(foreign_key="message.id", nullable=True)
    message: "Message" = Relationship(back_populates="usage_logs")


class Conversation(BaseModelMixin, ConversationBase, table=True):
    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    user: User = Relationship(back_populates="conversations")

    usage_logs: list[ModelUsageLog] = Relationship(back_populates="conversation")

    messages: list["Message"] = Relationship(
        back_populates="conversation", cascade_delete=True
    )


class Message(BaseModelMixin, MessageBase, table=True):
    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    user: User = Relationship(back_populates="messages")

    conversation_id: UUID = Field(foreign_key="conversation.id", nullable=False)
    conversation: Conversation = Relationship(back_populates="messages")

    model_id: UUID = Field(foreign_key="llmmodel.id", nullable=False)
    model: LlmModel = Relationship(back_populates="messages")

    usage_logs: list[ModelUsageLog] = Relationship(back_populates="message")


class MessageWithUsageLogs(BaseModelMixin, MessageBase):
    user_id: UUID
    conversation_id: UUID
    model_id: UUID

    usage_logs: list[ModelUsageLog] = []


class Organization(BaseModelMixin, OrganizationBase, table=True):
    divisions: list["Division"] = Relationship(back_populates="organization")
    users: list[User] = Relationship(back_populates="organization")


class Division(BaseModelMixin, DivisionBase, table=True):
    organization_id: UUID = Field(foreign_key="organization.id")
    organization: Organization = Relationship(back_populates="divisions")

    __table_args__ = (
        UniqueConstraint(
            "organization_id", "slug", name="unique_division_organization_slug"
        ),
        UniqueConstraint(
            "organization_id", "name", name="unique_division_organization_name"
        ),
    )

    users: list[User] = Relationship(back_populates="division")
    teams: list["Team"] = Relationship(back_populates="division")


class Team(BaseModelMixin, TeamBase, table=True):
    division_id: UUID = Field(foreign_key="division.id", nullable=False, index=True)
    division: Division = Relationship(back_populates="teams")

    __table_args__ = (
        UniqueConstraint("division_id", "slug", name="unique_team_division_slug"),
        UniqueConstraint("division_id", "name", name="unique_team_division_name"),
    )

    members: list[User] = Relationship(back_populates="teams", link_model=UserTeamLink)


class Feature(BaseModelMixin, FeatureBase, table=True):
    pass


class FileKnowledgeBaseLink(TimeStampMixin, SQLModel, table=True):
    file_id: UUID = Field(foreign_key="file.id", primary_key=True, ondelete="RESTRICT")
    knowledge_base_id: UUID = Field(
        foreign_key="knowledgebase.id",
        primary_key=True,
        ondelete="CASCADE",
    )

    status: str = Field(
        sa_column=Column(
            String, nullable=True, server_default=FileProcessingStatus.PENDING.value
        ),
        default=FileProcessingStatus.PENDING.value,
    )

    error_message: Optional[str] = Field(default=None, nullable=True)


class File(BaseModelMixin, FileBase, table=True):
    owner_id: UUID = Field(foreign_key="user.id")
    owner: User = Relationship(back_populates="files")

    knowledge_bases: list["KnowledgeBase"] = Relationship(
        back_populates="files",
        link_model=FileKnowledgeBaseLink,
        sa_relationship_kwargs={"passive_deletes": True},
    )


class KnowledgeBase(BaseModelMixin, KnowledgeBaseBase, table=True):
    owner_id: UUID = Field(foreign_key="user.id")
    owner: User = Relationship(back_populates="knowledge_bases")

    files: list[File] = Relationship(
        back_populates="knowledge_bases",
        link_model=FileKnowledgeBaseLink,
        sa_relationship_kwargs={"passive_deletes": True},
    )
