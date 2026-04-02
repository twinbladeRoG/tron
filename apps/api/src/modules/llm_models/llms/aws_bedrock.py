from typing import Any

from langchain_aws import ChatBedrockConverse

from src.core.config import settings


class AWSBedrockModelProvider:
    """
    Documentation:  https://docs.langchain.com/oss/python/integrations/providers/aws
                    https://docs.langchain.com/oss/python/integrations/chat/bedrock
    """

    def get_model(
        self, model_name: str, credential: dict[str, Any] | None = None
    ) -> ChatBedrockConverse:
        config = credential or {
            "aws_access_key_id": settings.AWS_ACCESS_KEY_ID.get_secret_value() or None,
            "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY.get_secret_value()
            or None,
            "region_name": settings.AWS_DEFAULT_REGION or None,
        }

        return ChatBedrockConverse(
            aws_access_key_id=config.get("aws_access_key_id"),
            aws_secret_access_key=config.get("aws_secret_access_key"),
            region_name=config.get("region_name"),
            model=model_name,
            temperature=0,
            timeout=None,
            max_retries=2,
        )
