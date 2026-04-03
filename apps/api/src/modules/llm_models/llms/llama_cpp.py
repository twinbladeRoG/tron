from langchain_deepseek import ChatDeepSeek

from src.core.config import settings
from src.modules.llm_models.llms.schema import LlamaCppChatModelParams

from .common import get_openai_style_model_params


class LlamaCppProvider:
    def get_model(
        self,
        model_name: str,
        model_params: LlamaCppChatModelParams | None = None,
    ) -> ChatDeepSeek:
        params = model_params or LlamaCppChatModelParams()
        llm = ChatDeepSeek(
            api_base=f"{settings.LOCAL_LLM_HOST}/v1",
            api_key=settings.LOCAL_LLM_SECRET,
            model=model_name,
            **get_openai_style_model_params(params),
        )
        return llm
