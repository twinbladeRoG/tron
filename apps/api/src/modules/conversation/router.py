from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query

from src.core.dependencies import (
    ConversationControllerDeps,
    CurrentUser,
    MessageControllerDeps,
)
from src.models.models import Conversation, MessageWithUsageLogs

from .schema import ConversationFilterParams

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get("/", response_model=list[Conversation])
def get_conversations(
    user: CurrentUser,
    controller: ConversationControllerDeps,
    filter: Annotated[ConversationFilterParams, Query()],
):
    return controller.get_users_conversations(user)


@router.get("/{id}/messages", response_model=list[MessageWithUsageLogs])
def get_conversation_messages(
    id: UUID,
    user: CurrentUser,
    controller: ConversationControllerDeps,
    message_controller: MessageControllerDeps,
):
    conversation = controller.get_conversation(id, user)
    return message_controller.get_messages_of_conversation(conversation.id)


@router.delete("/{id}", response_model=Conversation)
def delete_conversation(
    id: UUID, user: CurrentUser, controller: ConversationControllerDeps
):
    return controller.delete_conversation(id, user)
