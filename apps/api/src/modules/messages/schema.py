from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel


class MessageBase(SQLModel):
    content: str = Field()
    reason: Optional[str] = Field()
    type: str


class CreateMessage(MessageBase):
    user_id: UUID
    conversation_id: UUID
    model_id: UUID
