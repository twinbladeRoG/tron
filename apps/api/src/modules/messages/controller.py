from uuid import UUID

from langchain_core.messages import ToolMessage

from src.core.controller.base import BaseController
from src.models.models import Conversation, LlmModel, Message, User

from .repository import MessageRepository
from .schema import CreateMessage, MessageBase


class MessageController(BaseController[Message]):
    def __init__(self, repository: MessageRepository) -> None:
        super().__init__(model=Message, repository=repository)
        self.repository = repository

    def upsert_message(
        self,
        data: MessageBase,
        *,
        user: User,
        conversation: Conversation,
        model: LlmModel,
        previous_message: Message | None = None,
    ) -> Message:
        if previous_message is not None:
            new_message = previous_message
            new_message.content = previous_message.content + data.content
            new_message.run_id = data.run_id

            if data.tool_calls is not None and len(data.tool_calls) > 0:
                new_message.tool_calls = (
                    new_message.tool_calls or []
                ) + data.tool_calls

            if data.reason is not None and data.reason.strip() != "":
                new_message.reason = (
                    (new_message.reason + "\n\n") if new_message.reason else ""
                ) + data.reason

            return self.repository.update(previous_message.id, new_message.model_dump())
        else:
            return self.repository.add_message(
                CreateMessage(
                    **data.model_dump(),
                    user_id=user.id,
                    conversation_id=conversation.id,
                    model_id=model.id,
                )
            )

    def append_tool_message(self, tool_message: ToolMessage, run_id: UUID) -> Message:
        message = self.repository.get_message_by_run_id(run_id)

        return self.repository.update(
            message.id,
            {
                "tool_calls": (message.tool_calls or [])
                + [tool_message.model_dump_json()]
            },
        )

    def get_messages_of_conversation(self, conversation_id: UUID) -> list[Message]:
        return self.repository.get_messages_of_conversation(conversation_id)
