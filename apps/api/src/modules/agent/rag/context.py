from dataclasses import dataclass
from uuid import UUID

from src.modules.file_storage.controller import FileController
from src.modules.knowledge_base.controller import KnowledgeBaseController


@dataclass
class Context:
    """Custom runtime context schema."""

    user_id: UUID
    knowledge_base_id: UUID
    knowledge_base_controller: KnowledgeBaseController
    file_controller: FileController
