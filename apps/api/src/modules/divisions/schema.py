from sqlmodel import Field, SQLModel


class DivisionBase(SQLModel):
    name: str = Field(index=True, nullable=False)
    slug: str = Field(index=True, nullable=False)
