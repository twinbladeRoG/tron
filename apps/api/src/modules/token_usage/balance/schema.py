from uuid import UUID

from sqlmodel import Field, SQLModel


class TokenBalanceBase(SQLModel):
    subject_type: str = Field(primary_key=True)
    subject_id: UUID = Field(primary_key=True)

    model_id: UUID = Field(primary_key=True)
    period_key: str = Field(primary_key=True)

    used_tokens: int = Field(default=0)
