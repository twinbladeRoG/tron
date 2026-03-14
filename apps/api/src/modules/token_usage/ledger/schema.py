from typing import Literal
from uuid import UUID

from sqlmodel import Column, Field, SQLModel, String


class TokenLedgerBase(SQLModel):
    bucket_id: UUID

    tokens: int
    entry_type: Literal["usage", "refund", "credit"] = Field(sa_column=Column(String))
    period_key: str
