from typing import Optional

from sqlmodel import Field, SQLModel


class KnowledgeBaseBase(SQLModel):
    name: str = Field(min_length=3, max_length=255, unique=True)
    description: Optional[str] = Field(default=None, max_length=255, nullable=True)
    vector_store_name: str = Field(min_length=3, max_length=255)
