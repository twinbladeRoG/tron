from typing import Optional

from sqlmodel import Field, SQLModel


class FeatureBase(SQLModel):
    name: str = Field(unique=True, nullable=False)
    slug: str = Field(unique=True, nullable=False)
    description: Optional[str] = Field(default=None, nullable=True)
    is_active: bool = Field(default=True, nullable=False)
