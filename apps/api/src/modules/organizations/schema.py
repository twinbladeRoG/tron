from sqlmodel import Field, SQLModel


class OrganizationBase(SQLModel):
    name: str = Field(index=True, nullable=True, unique=True)
    slug: str = Field(index=True, nullable=True, unique=True)
