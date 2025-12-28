from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel

from src.utils.time import utcnow


class ConversationBase(SQLModel):
    title: str = Field()


class CreateConversation(ConversationBase):
    user_id: UUID


class ConversationFilterParams(SQLModel):
    from_date: datetime
    to_date: datetime | None = utcnow()
    search: Optional[str] = None


class MessageBase(SQLModel):
    model_id: UUID = Field(default_factory=uuid4, primary_key=True)
    content: str = Field()
    reason: Optional[str] = Field()
    type: str
