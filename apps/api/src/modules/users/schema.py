from typing import Optional
from uuid import UUID

from pydantic import EmailStr
from sqlmodel import Field, SQLModel

from src.models.mixins import BaseModelMixin


class UserBase(SQLModel):
    username: str = Field(unique=True, min_items=1, max_length=255)
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    first_name: str = Field(default=None, max_length=255)
    last_name: Optional[str] = Field(default=None, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserPublic(BaseModelMixin, UserBase):
    pass


class PaginatedFilterParams(SQLModel):
    page: int = Field(0, ge=0)
    limit: int = Field(100, gt=0, le=100)
    search: Optional[str] = Field(default=None)
    organization_id: Optional[UUID] = Field(default=None)


class UserAttachOrganizationRequest(SQLModel):
    organization_id: UUID


class UserAttachDivisionRequest(SQLModel):
    division_id: UUID
