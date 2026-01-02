from datetime import datetime
from typing import Optional
from uuid import UUID

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
