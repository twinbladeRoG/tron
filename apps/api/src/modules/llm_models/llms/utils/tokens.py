from collections.abc import Callable, Sequence
from typing import (
    Any,
)

import tiktoken
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage, get_buffer_string
from langchain_core.tools import BaseTool

# !REFER: from langchain_openai/chat_models/base.py#L1705


def get_num_tokens_from_messages(
    messages: Sequence[BaseMessage],
    chat_model: BaseChatModel,
    tools: Sequence[dict[str, Any] | type | Callable | BaseTool] | None = None,
) -> int:
    try:
        return chat_model.get_num_tokens_from_messages(list(messages), tools=tools)
    except NotImplementedError:
        encoding = tiktoken.get_encoding("cl100k_base")
        text = get_buffer_string(messages)
        return len(encoding.encode(text))
