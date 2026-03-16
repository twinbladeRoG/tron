from langchain_openai import AzureChatOpenAI

from src.core.config import settings


class AzureOpenAIModelProvider:
    def __init__(self) -> None:
        pass

    def get_model(self, model_name: str) -> AzureChatOpenAI:
        llm = AzureChatOpenAI(
            api_key=settings.AZURE_OPEN_AI_KEY,
            api_version=settings.AZURE_OPEN_AI_VERSION,
            azure_endpoint=settings.AZURE_OPEN_AI_ENDPOINT,
            model=model_name,
            temperature=0,
            timeout=None,
            max_retries=2,
            stream_usage=True,
        )
        return llm
