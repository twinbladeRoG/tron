from pydantic import BaseModel, Field


class ChatPayload(BaseModel):
    message: str = Field(min_length=1)
    max_steps: int = Field(default=7, ge=1, le=50)
