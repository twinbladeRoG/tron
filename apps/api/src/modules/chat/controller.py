import json
from uuid import uuid4

from langchain.messages import HumanMessage, SystemMessage
from sqlmodel import Session

from src.core.exception import BadRequestException
from src.core.logger import logger
from src.models.models import User
from src.modules.llm_models.controller import LlmModelController
from src.modules.llm_models.llms.utils.callbacks import get_llm_callback
from src.modules.llm_models.llms.utils.tokens import get_num_tokens_from_messages

from .schema import ChatPayload


class ChatController:
    def __init__(self, session: Session) -> None:
        self.session = session

    async def chat(
        self, data: ChatPayload, *, user: User, llm_model_controller: LlmModelController
    ):
        llm_model = llm_model_controller.get_llm_model_by_name(data.model)
        chat_model = llm_model_controller.get_chat_model(llm_model)

        messages = [
            SystemMessage(content="You are a helpful assistant"),
            HumanMessage(content=data.message),
        ]

        conversation_id = uuid4()
        yield f"event: conversationId\ndata: {conversation_id}\n\n"

        try:
            tokens = get_num_tokens_from_messages(messages, chat_model)
            if tokens > 2:
                raise BadRequestException("Insufficient Tokens")

            with get_llm_callback(self.session) as cb:
                async for chunk in chat_model.astream(
                    input=messages,
                    config={
                        "run_id": conversation_id,
                        "metadata": {
                            "model_id": llm_model.id.hex,
                            "model_name": llm_model.name,
                            "user_id": user.id.hex,
                        },
                        "tags": ["chat"],
                    },
                ):
                    message = {"text": chunk.content}
                    yield f"event: message\ndata: {json.dumps(message)}\n\n"

                    if chunk.usage_metadata:
                        yield f"event: token_usage\ndata: {json.dumps(chunk.usage_metadata)}\n\n"

                yield f"event: usage\ndata: {cb.get_usage().model_dump_json()}\n\n"
        except Exception as e:
            logger.error(e)
            yield f"event: error\ndata: {e.__class__.__name__}: {e}\n\n"
        finally:
            yield "event: done\ndata: end\n\n"
