from typing import Any

from langchain_openai import AzureChatOpenAI

from src.core.config import settings
from src.modules.llm_models.llms.schema import AzureOpenAIChatModelParams

from .common import get_openai_style_model_params


class AzureOpenAIModelProvider:
    def __init__(self) -> None:
        pass

    def get_model(
        self,
        model_name: str,
        credential: dict[str, Any] | None = None,
        model_params: AzureOpenAIChatModelParams | None = None,
    ) -> AzureChatOpenAI:
        config = credential or {
            "api_key": settings.AZURE_OPEN_AI_KEY.get_secret_value(),
            "api_version": settings.AZURE_OPEN_AI_VERSION,
            "azure_endpoint": settings.AZURE_OPEN_AI_ENDPOINT,
        }
        params = model_params or AzureOpenAIChatModelParams()
        return AzureChatOpenAI(
            api_key=config["api_key"],
            api_version=config["api_version"],
            azure_endpoint=config["azure_endpoint"],
            model=model_name,
            **get_openai_style_model_params(params),
        )
