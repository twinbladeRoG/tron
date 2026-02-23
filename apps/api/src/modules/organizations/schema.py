from sqlmodel import Field, SQLModel


class OrganizationBase(SQLModel):
    name: str = Field(nullable=False, unique=True)
    slug: str = Field(nullable=False, unique=True)


class PaginatedFilterParams(SQLModel):
    page: int = Field(0, ge=0)
    limit: int = Field(100, gt=0, le=100)
