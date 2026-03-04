from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query

from src.core.dependencies import CurrentUser, KnowledgeBaseControllerDeps
from src.models.models import KnowledgeBase
from src.models.pagination import KnowledgeBasePaginated
from src.modules.vector_db.embeddings import EmbeddingModel

from .schema import CreateKnowledgeBaseRequest, PaginatedFilterParams

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])


@router.get("/embedding-providers", response_model=dict[str, list[EmbeddingModel]])
def get_embedding_providers(user: CurrentUser, controller: KnowledgeBaseControllerDeps):
    return controller.get_embedding_models()


@router.get("/", response_model=KnowledgeBasePaginated)
def get_knowledge_bases(
    user: CurrentUser,
    controller: KnowledgeBaseControllerDeps,
    query: Annotated[PaginatedFilterParams, Query()],
):
    knowledge_bases, pagination = controller.get_users_knowledge_bases(user.id, query)
    return KnowledgeBasePaginated(data=list(knowledge_bases), pagination=pagination)


@router.post("/", response_model=KnowledgeBase)
def create_knowledge_base(
    user: CurrentUser,
    controller: KnowledgeBaseControllerDeps,
    body: CreateKnowledgeBaseRequest,
):
    return controller.create_knowledge_base(body, user=user)


@router.get("/{identifier}", response_model=KnowledgeBase)
def get_knowledge_base(
    user: CurrentUser, controller: KnowledgeBaseControllerDeps, identifier: UUID | str
):
    return controller.get_knowledge_base(identifier, user)


@router.delete("/{id}", response_model=KnowledgeBase)
def delete_knowledge_base(
    user: CurrentUser, controller: KnowledgeBaseControllerDeps, id: UUID
):
    return controller.remove_knowledge_base(id, user)
