from typing import Literal, Optional
from uuid import UUID

from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Column, Field, SQLModel, String


class MessageBase(SQLModel):
    content: str = Field()
    reason: Optional[str] = Field(default=None)
    type: Literal["human", "ai"] = Field(sa_column=Column(String))
    run_id: UUID | None = Field(default=None, nullable=True)
    tool_calls: list[dict] | None = Field(sa_type=JSONB, default=None, nullable=True)


class CreateMessage(MessageBase):
    user_id: UUID
    conversation_id: UUID
    model_id: UUID
