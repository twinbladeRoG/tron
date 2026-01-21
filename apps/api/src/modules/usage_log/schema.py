from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import model_validator
from sqlmodel import Field, SQLModel


class ModelUsageLogBase(SQLModel):
    total_tokens: int = Field(default=0)
    prompt_tokens: int = Field(default=0)
    prompt_tokens_cached: int = Field(default=0)
    completion_tokens: int = Field(default=0)
    reasoning_tokens: int = Field(default=0)
    successful_requests: int = Field(default=0)
    total_cost: float = Field(default=0.0)
    start_time: Optional[datetime] = Field(default=None)
    end_time: Optional[datetime] = Field(default=None)
    time: float = Field(default=0)


class CreateModelUsageLog(ModelUsageLogBase):
    model_id: UUID
    user_id: UUID
    conversation_id: UUID
    message_id: UUID


class FilterParams(SQLModel):
    model_name: str = Field()
    from_date: datetime | None = Field(default=None)
    to_date: datetime | None = Field(default=None)

    @model_validator(mode="after")
    def validate_dates(self):
        # Rule 1: to_date required if from_date is provided
        if self.from_date and not self.to_date:
            raise ValueError("`to_date` is required when `from_date` is provided.")

        # Rule 2: to_date >= from_date
        if self.from_date and self.to_date and self.to_date < self.from_date:
            raise ValueError("`to_date` cannot be older than `from_date`.")

        return self
