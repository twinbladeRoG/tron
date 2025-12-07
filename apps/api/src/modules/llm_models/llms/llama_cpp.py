from langchain_deepseek import ChatDeepSeek

from src.core.config import settings


class LlamaCppProvider:
    def get_model(self, model_name: str) -> ChatDeepSeek:
        llm = ChatDeepSeek(
            api_base=f"{settings.LOCAL_LLM_HOST}/v1",
            api_key=settings.LOCAL_LLM_SECRET,
            model=model_name,
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
            stream_usage=True,
            # reasoning={"effort": "high", "summary": "detailed"},
        )
        return llm
