from uuid import UUID

from src.core.controller.base import BaseController
from src.core.exception import BadRequestException
from src.models.models import LlmCredential

from .repository import LlmCredentialRepository
from .schema import LlmCredentialCreate, LlmCredentialRead, LlmCredentialUpdate


class LlmCredentialController(BaseController[LlmCredential]):
    def __init__(self, repository: LlmCredentialRepository) -> None:
        super().__init__(model=LlmCredential, repository=repository)
        self.repository = repository

    def get_llm_credentials(self):
        return [self._serialize(credential) for credential in self.repository.get_all()]

    def get_llm_credential(self, id: UUID):
        return self._serialize(self.get_by_id(id))

    def add_llm_credential(self, data: LlmCredentialCreate):
        return self._serialize(self.create(data))

    def update_llm_credential(self, id: UUID, data: LlmCredentialUpdate):
        current_credential = self.get_by_id(id)
        attributes = data.model_dump(exclude_none=True)
        raw_payload = attributes.get("encrypted_payload")

        if raw_payload is None or not str(raw_payload).strip():
            attributes.pop("encrypted_payload", None)

        if (
            attributes.get("provider") is not None
            and attributes["provider"] != current_credential.provider
            and "encrypted_payload" not in attributes
        ):
            raise BadRequestException(
                "Updating the provider requires a new credential payload."
            )

        return self._serialize(self.repository.update(id, attributes))

    def remove_llm_credential(self, id: UUID):
        credential = self.get_by_id(id)
        serialized = self._serialize(credential)
        self.repository.delete(credential)
        return serialized

    def _serialize(self, credential: LlmCredential) -> LlmCredentialRead:
        return LlmCredentialRead.model_validate(
            {
                "id": credential.id,
                "created_at": credential.created_at,
                "updated_at": credential.updated_at,
                "name": credential.name,
                "provider": credential.provider,
                "has_payload": bool(
                    credential.encrypted_payload
                    and credential.encrypted_payload.strip()
                ),
            }
        )
