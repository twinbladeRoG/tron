import base64
import hashlib
import os

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from src.core.config import settings
from src.core.exception import BadRequestException


class LlmCredentialCrypto:
    VERSION_PREFIX = "enc:v1:"
    NONCE_SIZE = 12

    def encrypt(self, payload: str) -> str:
        normalized_payload = payload.strip()
        if not normalized_payload:
            raise BadRequestException("Credential payload cannot be empty.")

        if self.is_encrypted(normalized_payload):
            return normalized_payload

        nonce = os.urandom(self.NONCE_SIZE)
        ciphertext = AESGCM(self._key).encrypt(
            nonce, normalized_payload.encode("utf-8"), None
        )
        token = base64.urlsafe_b64encode(nonce + ciphertext).decode("utf-8")
        return f"{self.VERSION_PREFIX}{token}"

    def decrypt(self, payload: str) -> str:
        normalized_payload = payload.strip()
        if not normalized_payload:
            raise BadRequestException("Credential payload cannot be empty.")

        if not self.is_encrypted(normalized_payload):
            # Backward compatibility for rows written before encryption-at-rest.
            return normalized_payload

        token = normalized_payload.removeprefix(self.VERSION_PREFIX)
        try:
            encrypted_bytes = base64.urlsafe_b64decode(token.encode("utf-8"))
            nonce = encrypted_bytes[: self.NONCE_SIZE]
            ciphertext = encrypted_bytes[self.NONCE_SIZE :]
            plaintext = AESGCM(self._key).decrypt(nonce, ciphertext, None)
        except (ValueError, InvalidTag) as exc:
            raise BadRequestException(
                "Credential payload could not be decrypted."
            ) from exc

        decoded_payload = plaintext.decode("utf-8").strip()
        if not decoded_payload:
            raise BadRequestException("Credential payload cannot be empty.")

        return decoded_payload

    def is_encrypted(self, payload: str | None) -> bool:
        return bool(payload and payload.startswith(self.VERSION_PREFIX))

    @property
    def _key(self) -> bytes:
        app_key = settings.APP_KEY.get_secret_value().strip()
        if not app_key:
            raise BadRequestException("APP_KEY must be configured for credential encryption.")

        return hashlib.sha256(app_key.encode("utf-8")).digest()
