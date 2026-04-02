from typing import Any

from langchain_openai import AzureChatOpenAI

from src.core.config import settings


class AzureOpenAIModelProvider:
    def __init__(self) -> None:
        pass

    def get_model(
        self, model_name: str, credential: dict[str, Any] | None = None
    ) -> AzureChatOpenAI:
        config = credential or {
            "api_key": settings.AZURE_OPEN_AI_KEY.get_secret_value(),
            "api_version": settings.AZURE_OPEN_AI_VERSION,
            "azure_endpoint": settings.AZURE_OPEN_AI_ENDPOINT,
        }
        return AzureChatOpenAI(
            api_key=config["api_key"],
            api_version=config["api_version"],
            azure_endpoint=config["azure_endpoint"],
            model=model_name,
            temperature=0,
            timeout=None,
            max_retries=2,
            stream_usage=True,
        )
