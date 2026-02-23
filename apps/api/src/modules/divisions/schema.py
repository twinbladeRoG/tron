from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel


class DivisionBase(SQLModel):
    name: str = Field(index=True, nullable=False)
    slug: str = Field(index=True, nullable=False)


class PaginatedFilterParams(SQLModel):
    page: int = Field(0, ge=0)
    limit: int = Field(100, gt=0, le=100)
    search: Optional[str] = Field(default=None)
    organization: Optional[str] = Field(default=None)


class CreateDivision(DivisionBase):
    organization_id: UUID
