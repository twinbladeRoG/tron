from langchain_openai import ChatOpenAI

from src.core.config import settings


class OpenAIModelProvider:
    def __init__(self):
        pass

    def get_model(self, model_name: str) -> ChatOpenAI:
        llm = ChatOpenAI(
            api_key=settings.OPEN_API_KEY,
            model=model_name,
            temperature=0,
            timeout=None,
            max_retries=2,
            stream_usage=True,
        )
        return llm
