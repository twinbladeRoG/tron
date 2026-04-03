from typing import Any

from langchain_openai import ChatOpenAI

from src.core.config import settings
from src.modules.llm_models.llms.schema import OpenAIChatModelParams

from .common import get_openai_style_model_params


class OpenAIModelProvider:
    def __init__(self):
        pass

    def get_model(
        self,
        model_name: str,
        credential: dict[str, Any] | None = None,
        model_params: OpenAIChatModelParams | None = None,
    ) -> ChatOpenAI:
        config = credential or {"api_key": settings.OPEN_API_KEY.get_secret_value()}
        params = model_params or OpenAIChatModelParams()

        llm = ChatOpenAI(
            api_key=config["api_key"],
            model=model_name,
            **get_openai_style_model_params(params),
        )
        return llm
