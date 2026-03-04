from fastapi import APIRouter

from src.core.dependencies import KnowledgeBaseControllerDeps
from src.modules.vector_db.embeddings import EmbeddingModel

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])


@router.get("/embedding-providers", response_model=dict[str, list[EmbeddingModel]])
def get_embedding_providers(controller: KnowledgeBaseControllerDeps):
    return controller.get_embedding_models()
