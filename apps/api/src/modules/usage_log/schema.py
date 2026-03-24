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

    total_cost: float = Field(default=0.0)

    successful_requests: int = Field(default=0)

    start_time: Optional[datetime] = Field(default=None)
    end_time: Optional[datetime] = Field(default=None)
    time: float = Field(default=0)


class CreateModelUsageLog(ModelUsageLogBase):
    model_id: UUID
    user_id: UUID
    conversation_id: UUID
    message_id: UUID


class PaginatedFilterParams(SQLModel):
    page: int = Field(0, ge=0)
    limit: int = Field(100, gt=0, le=100)

    model_name: str = Field()
    user_id: Optional[UUID] = None

    from_date: Optional[datetime] = Field(default=None)
    to_date: Optional[datetime] = Field(default=None)

    @model_validator(mode="after")
    def validate_dates(self):
        # Rule 1: to_date required if from_date is provided
        if self.from_date and not self.to_date:
            raise ValueError("`to_date` is required when `from_date` is provided.")

        # Rule 2: to_date >= from_date
        if self.from_date and self.to_date and self.to_date < self.from_date:
            raise ValueError("`to_date` cannot be older than `from_date`.")

        return self
