from uuid import UUID

from sqlmodel import SQLModel

from src.models.models import Division, Organization, Team, User


class TokenUsagePerBucket(SQLModel):
    subject_type: str
    subject_id: UUID
    subject: User | Team | Division | Organization | None = None
    limit: int
    used: int
    remaining: int


class TokenUsage(SQLModel):
    total_limit: int
    total_used: int
    total_remaining: int

    buckets: list[TokenUsagePerBucket]
