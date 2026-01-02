from uuid import UUID

from fastapi import APIRouter

from src.core.dependencies import (
    CurrentUser,
    MessageControllerDeps,
)
from src.models.models import Message

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("/{conversation_id}", response_model=list[Message])
def get_messages(
    user: CurrentUser, controller: MessageControllerDeps, conversation_id: UUID
):
    return None
