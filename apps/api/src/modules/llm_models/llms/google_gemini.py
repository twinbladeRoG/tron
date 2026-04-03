from typing import Any

from google.oauth2 import service_account
from langchain_google_genai import ChatGoogleGenerativeAI

from src.core.config import settings
from src.modules.llm_models.llms.schema import GoogleGeminiChatModelParams

from .common import get_google_model_params


class GoogleGeminiModelProvider:
    """
    Documentation: https://docs.langchain.com/oss/python/integrations/chat/google_generative_ai
    """

    def get_model(
        self,
        model_name: str,
        credential: dict[str, Any] | None = None,
        model_params: GoogleGeminiChatModelParams | None = None,
    ) -> ChatGoogleGenerativeAI:
        if credential and credential.get("service_account_info"):
            credentials = service_account.Credentials.from_service_account_info(
                credential["service_account_info"],
                scopes=["https://www.googleapis.com/auth/cloud-platform"],
            )
        else:
            credentials = service_account.Credentials.from_service_account_file(
                settings.GOOGLE_SERVICE_ACCOUNT_FILE_PATH,
                scopes=["https://www.googleapis.com/auth/cloud-platform"],
            )

        config = credential or {
            "project": settings.GOOGLE_CLOUD_PROJECT or None,
            "location": settings.GOOGLE_CLOUD_LOCATION or None,
            "vertexai": settings.GOOGLE_GENAI_USE_VERTEXAI,
        }
        params = model_params or GoogleGeminiChatModelParams()

        return ChatGoogleGenerativeAI(
            credentials=credentials,
            project=config.get("project"),
            location=config.get("location"),
            vertexai=config.get("vertexai"),
            model=model_name,
            **get_google_model_params(params),
        )
