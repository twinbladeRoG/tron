from uuid import UUID

from sqlmodel import SQLModel

from src.models.models import File

from ..schema import ChatPayload


class RagChatPayload(ChatPayload):
    knowledge_base_id: UUID


class RetrievedDocumentChunk(SQLModel):
    text: str
    file: File
    score: float
