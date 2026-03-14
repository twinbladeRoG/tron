from datetime import datetime
from uuid import UUID

from sqlmodel import Field, SQLModel


class TokenReservationBase(SQLModel):
    request_id: UUID = Field(index=True)
    bucket_id: UUID

    reserved_tokens: int
    period_key: str
    expires_at: datetime
