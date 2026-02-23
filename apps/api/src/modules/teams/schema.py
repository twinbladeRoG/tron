from sqlmodel import Field, SQLModel


class TeamBase(SQLModel):
    name: str = Field(index=True, nullable=False)
    slug: str = Field(index=True, nullable=False)
