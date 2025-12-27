from datetime import datetime
from typing import Optional
from uuid import UUID

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
