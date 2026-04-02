import json
from typing import Any

from src.core.config import settings
from src.core.exception import BadRequestException
from src.models.models import LlmCredential
from src.modules.llm_models.schema import LlmProvider

from .crypto import LlmCredentialCrypto


class LlmCredentialService:
    def __init__(self) -> None:
        self.crypto = LlmCredentialCrypto()

    def resolve(
        self, provider: str | LlmProvider, credential: LlmCredential | None
    ) -> dict[str, Any]:
        provider_value = (
            provider.value if isinstance(provider, LlmProvider) else provider
        )

        match provider_value:
            case LlmProvider.OPEN_AI.value:
                return self._resolve_openai(credential)
            case LlmProvider.AZURE.value:
                return self._resolve_azure(credential)
            case LlmProvider.GOOGLE.value:
                return self._resolve_google(credential)
            case LlmProvider.AWS.value:
                return self._resolve_aws(credential)
            case _:
                return {}

    def _resolve_openai(self, credential: LlmCredential | None) -> dict[str, Any]:
        if credential is None:
            return {"api_key": settings.OPEN_API_KEY.get_secret_value()}

        payload = self._parse_payload(credential)
        if isinstance(payload, str):
            api_key = payload.strip()
        elif isinstance(payload, dict):
            api_key = self._get_required_str(payload, "api_key", credential.provider)
        else:
            raise BadRequestException(
                "OpenAI credential payload must be a string or JSON object."
            )

        return {"api_key": api_key}

    def _resolve_azure(self, credential: LlmCredential | None) -> dict[str, Any]:
        if credential is None:
            return {
                "api_key": settings.AZURE_OPEN_AI_KEY.get_secret_value(),
                "azure_endpoint": settings.AZURE_OPEN_AI_ENDPOINT,
                "api_version": settings.AZURE_OPEN_AI_VERSION,
            }

        payload = self._parse_json_object(credential)
        return {
            "api_key": self._get_required_str(payload, "api_key", credential.provider),
            "azure_endpoint": self._get_required_str(
                payload, "azure_endpoint", credential.provider
            ),
            "api_version": self._get_required_str(
                payload, "api_version", credential.provider
            ),
        }

    def _resolve_google(self, credential: LlmCredential | None) -> dict[str, Any]:
        if credential is None:
            return {
                "service_account_file_path": settings.GOOGLE_SERVICE_ACCOUNT_FILE_PATH,
                "project": settings.GOOGLE_CLOUD_PROJECT or None,
                "location": settings.GOOGLE_CLOUD_LOCATION or None,
                "vertexai": settings.GOOGLE_GENAI_USE_VERTEXAI,
            }

        payload = self._parse_json_object(credential)
        service_account_info = payload.get("service_account_info", payload)
        if not isinstance(service_account_info, dict):
            raise BadRequestException(
                "Google credential payload must contain a JSON service account object."
            )

        project = (
            payload.get("project")
            or payload.get("project_id")
            or service_account_info.get("project_id")
            or settings.GOOGLE_CLOUD_PROJECT
            or None
        )
        location = payload.get("location") or settings.GOOGLE_CLOUD_LOCATION or None
        vertexai = payload.get("vertexai", settings.GOOGLE_GENAI_USE_VERTEXAI)

        return {
            "service_account_info": service_account_info,
            "project": project,
            "location": location,
            "vertexai": bool(vertexai),
        }

    def _resolve_aws(self, credential: LlmCredential | None) -> dict[str, Any]:
        if credential is None:
            return {
                "aws_access_key_id": self._optional_str(
                    settings.AWS_ACCESS_KEY_ID.get_secret_value()
                ),
                "aws_secret_access_key": self._optional_str(
                    settings.AWS_SECRET_ACCESS_KEY.get_secret_value()
                ),
                "region_name": self._optional_str(settings.AWS_DEFAULT_REGION),
            }

        payload = self._parse_json_object(credential)
        return {
            "aws_access_key_id": self._get_required_str(
                payload, "aws_access_key_id", credential.provider
            ),
            "aws_secret_access_key": self._get_required_str(
                payload, "aws_secret_access_key", credential.provider
            ),
            "region_name": self._get_required_str(
                payload,
                "region_name",
                credential.provider,
                aliases=("region",),
            ),
        }

    def _parse_payload(self, credential: LlmCredential) -> Any:
        raw_payload = self.crypto.decrypt(credential.encrypted_payload)
        if not raw_payload:
            raise BadRequestException(
                f"{credential.provider} credential payload cannot be empty."
            )

        if (
            raw_payload.startswith("{")
            or raw_payload.startswith("[")
            or raw_payload.startswith('"')
        ):
            try:
                return json.loads(raw_payload)
            except json.JSONDecodeError as exc:
                raise BadRequestException(
                    f"{credential.provider} credential payload must be valid JSON."
                ) from exc

        return raw_payload

    def _parse_json_object(self, credential: LlmCredential) -> dict[str, Any]:
        payload = self._parse_payload(credential)
        if not isinstance(payload, dict):
            raise BadRequestException(
                f"{credential.provider} credential payload must be a JSON object."
            )
        return payload

    def _get_required_str(
        self,
        payload: dict[str, Any],
        field_name: str,
        provider: str | LlmProvider,
        *,
        aliases: tuple[str, ...] = (),
    ) -> str:
        keys = (field_name, *aliases)
        for key in keys:
            value = self._optional_str(payload.get(key))
            if value is not None:
                return value

        provider_value = (
            provider.value if isinstance(provider, LlmProvider) else provider
        )
        raise BadRequestException(
            f"{provider_value} credential payload must include '{field_name}'."
        )

    def _optional_str(self, value: Any) -> str | None:
        if value is None:
            return None

        normalized = str(value).strip()
        return normalized or None
