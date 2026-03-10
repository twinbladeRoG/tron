from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from src.utils.time import utcnow


class ConversationBase(SQLModel):
    title: str = Field()
    feature: str = Field(default="chat", sa_column_kwargs={"server_default": "chat"})
    parameters: dict | None = Field(sa_type=JSONB, default=None, nullable=True)


class CreateConversation(ConversationBase):
    user_id: UUID


class ConversationFilterParams(SQLModel):
    from_date: datetime
    to_date: datetime | None = utcnow()
    search: Optional[str] = None
