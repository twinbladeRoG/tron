from typing import Any, Optional, Type
from uuid import UUID

from sqlmodel import Session

from src.core.repository.base import BaseRepository
from src.models.models import LlmCredential

from .crypto import LlmCredentialCrypto


class LlmCredentialRepository(BaseRepository[LlmCredential]):
    def __init__(self, model: Type[LlmCredential], session: Session) -> None:
        super().__init__(model, session)
        self.crypto = LlmCredentialCrypto()

    def create(self, attributes: Optional[dict[str, Any]] = None) -> LlmCredential:
        return super().create(self._encrypt_payload(attributes))

    def update(
        self, id: UUID, attributes: Optional[dict[str, Any]] = None
    ) -> LlmCredential:
        return super().update(id, self._encrypt_payload(attributes))

    def _encrypt_payload(self, attributes: Optional[dict[str, Any]]) -> dict[str, Any]:
        payload = dict(attributes or {})
        raw_payload = payload.get("encrypted_payload")
        if raw_payload is not None:
            payload["encrypted_payload"] = self.crypto.encrypt(str(raw_payload))

        return payload
