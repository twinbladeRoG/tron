import json
from uuid import uuid4

from src.modules.llm_models.controller import LlmModelController

from .schema import ChatPayload


class ChatController:
    async def chat(
        self, data: ChatPayload, *, llm_model_controller: LlmModelController
    ):
        llm_model = llm_model_controller.get_llm_model_by_name(data.model)
        chat_model = llm_model_controller.get_chat_model(llm_model)

        messages = [
            ("system", "You are a helpful assistant"),
            ("human", data.message),
        ]

        conversation_id = uuid4()
        yield f"event: conversationId\ndata: {conversation_id}\n\n"

        async for chunk in chat_model.astream(input=messages):
            message = {"text": chunk.content}
            yield f"event: message\ndata: {json.dumps(message)}\n\n"

            if chunk.usage_metadata:
                yield f"event: usage\ndata: {json.dumps(chunk.usage_metadata)}\n\n"

        yield "event: done\ndata: end\n\n"
