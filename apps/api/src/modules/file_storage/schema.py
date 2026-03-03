from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel


class FileBase(SQLModel):
    filename: str = Field(min_length=1, max_length=255)
    original_filename: str = Field(min_length=1, max_length=255)
    content_type: str = Field(min_length=1, max_length=255)
    content_length: int = Field(ge=0)
    is_private: bool = Field(default=True)


class FileCreate(FileBase):
    owner_id: UUID


class FilePublic(FileBase):
    owner_id: UUID


class PaginatedFilterParams(SQLModel):
    page: int = Field(0, ge=0)
    limit: int = Field(100, gt=0, le=100)
    search: Optional[str] = Field(default=None)
    file_types: Optional[list[str]] = Field(default=None)
