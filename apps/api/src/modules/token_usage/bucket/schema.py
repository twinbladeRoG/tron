from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel


class TokenBucketBase(SQLModel):
    subject_type: str = Field(index=True)
    subject_id: UUID = Field(index=True)

    model_id: UUID

    parent_bucket_id: Optional[UUID] = None

    token_limit: int
    period_type: str = Field(default="monthly")


class CreateUserTokenBucket(SQLModel):
    model_id: UUID
    token_limit: int
    period_type: str = Field(default="monthly")


class ModelBucketQueryParams(SQLModel):
    page: int = Field(0, ge=0)
    limit: int = Field(100, gt=0, le=100)
    subject_type: Optional[str] = None
    subject_id: Optional[UUID] = None
    period_type: Optional[str] = None
