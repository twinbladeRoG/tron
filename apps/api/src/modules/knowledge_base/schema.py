from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel


class KnowledgeBaseBase(SQLModel):
    name: str = Field(min_length=3, max_length=255, index=True)
    slug: str = Field(nullable=False, unique=True)
    description: Optional[str] = Field(default=None, max_length=255, nullable=True)
    vector_store_name: str = Field(min_length=3, max_length=255)


class CreateKnowledgeBaseRequest(SQLModel):
    name: str = Field(min_length=3, max_length=255)
    description: Optional[str] = Field(default=None, max_length=255, nullable=True)


class CreateKnowledgeBase(KnowledgeBaseBase):
    owner_id: UUID


class PaginatedFilterParams(SQLModel):
    page: int = Field(0, ge=0)
    limit: int = Field(100, gt=0, le=100)
    search: Optional[str] = Field(default=None)


class AddFilesRequest(SQLModel):
    file_ids: list[UUID] = Field(min_length=1)
