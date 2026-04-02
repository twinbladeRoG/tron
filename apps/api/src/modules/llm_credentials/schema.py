from datetime import datetime
from uuid import UUID

from sqlmodel import Column, Field, SQLModel, String

from src.modules.llm_models.schema import LlmProvider


class LlmCredentialBase(SQLModel):
    name: str = Field(unique=True)
    provider: LlmProvider = Field(sa_column=Column(String))


class LlmCredentialCreate(LlmCredentialBase):
    encrypted_payload: str


class LlmCredentialUpdate(LlmCredentialBase):
    encrypted_payload: str | None = None


class LlmCredentialRead(LlmCredentialBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    has_payload: bool
