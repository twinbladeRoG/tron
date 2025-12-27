from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class ConversationBase(SQLModel):
    title: str = Field()


class MessageBase(SQLModel):
    model_id: UUID = Field(default_factory=uuid4, primary_key=True)
    content: str = Field()
    reason: Optional[str] = Field()
    type: str
