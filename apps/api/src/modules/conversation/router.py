from typing import Annotated

from fastapi import APIRouter, Query

from src.core.dependencies import (
    ConversationControllerDeps,
    CurrentUser,
)
from src.models.models import Conversation

from .schema import ConversationFilterParams

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get("/", response_model=list[Conversation])
def get_conversations(
    user: CurrentUser,
    controller: ConversationControllerDeps,
    filter: Annotated[ConversationFilterParams, Query()],
):
    return controller.get_users_conversations(user)
