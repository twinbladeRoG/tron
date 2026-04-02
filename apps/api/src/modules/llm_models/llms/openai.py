from typing import Any

from langchain_openai import ChatOpenAI

from src.core.config import settings


class OpenAIModelProvider:
    def __init__(self):
        pass

    def get_model(
        self, model_name: str, credential: dict[str, Any] | None = None
    ) -> ChatOpenAI:
        config = credential or {"api_key": settings.OPEN_API_KEY.get_secret_value()}
        llm = ChatOpenAI(
            api_key=config["api_key"],
            model=model_name,
            temperature=0,
            timeout=None,
            max_retries=2,
            stream_usage=True,
        )
        return llm
