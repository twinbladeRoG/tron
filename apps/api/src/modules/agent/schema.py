from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel


class ChatPayload(BaseModel):
    message: str
    model: str
    conversation_id: Optional[UUID] = None


class AgentWorkflowResponse(BaseModel):
    mermaid: str
    state: dict[str, list[dict[str, Any]]]
