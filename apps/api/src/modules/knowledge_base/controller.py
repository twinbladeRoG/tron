from qdrant_client import QdrantClient

from src.modules.vector_db.embeddings import EmbeddingService
from src.modules.vector_db.service import VectorDatabaseService


class KnowledgeBaseController:
    def __init__(self, vector_db: QdrantClient) -> None:
        self.vector_service = VectorDatabaseService(vector_db, EmbeddingService())

    def get_embedding_models(self):
        return self.vector_service.embedding_service.EMBEDDING_PROVIDERS
