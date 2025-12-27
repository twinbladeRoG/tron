from uuid import UUID

from pydantic import field_validator
from sqlmodel import Field, Relationship

from src.core.security import PasswordHandler
from src.modules.llm_models.schema import LlmModelBase
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


class LlmModel(BaseModelMixin, LlmModelBase, table=True):
    usage_logs: list["ModelUsageLog"] = Relationship(back_populates="model")


class ModelUsageLog(BaseModelMixin, ModelUsageLogBase, table=True):
    model_id: UUID = Field(foreign_key="llmmodel.id", nullable=False)
    model: LlmModel = Relationship(back_populates="usage_logs")

    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    user: User = Relationship(back_populates="usage_logs")
