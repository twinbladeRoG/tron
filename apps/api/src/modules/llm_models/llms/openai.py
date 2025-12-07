from enum import StrEnum

from langchain_openai import ChatOpenAI

from src.core.config import settings


class OpenAIModels(StrEnum):
    GPT_4o_mini = "gpt-4o-mini"
    GPT_5_nano = "gpt-5-nano"


class OpenAIModelProvider:
    def __init__(self):
        pass

    def get_model(self, model_name: OpenAIModels) -> ChatOpenAI:
        llm = ChatOpenAI(
            api_key=settings.OPEN_API_KEY,
            model=model_name,
            temperature=0,
            timeout=None,
            max_retries=2,
            stream_usage=True,
        )
        return llm
