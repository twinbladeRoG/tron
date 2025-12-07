from uuid import UUID

from fastapi import APIRouter

from src.core.dependencies import CurrentUser, LlmModelControllerDeps
from src.models.models import LlmModel

from .schema import LlmModelBase

router = APIRouter(prefix="/llm-models", tags=["LLM Models"])


@router.get("/", response_model=list[LlmModel])
def get_models(user: CurrentUser, controller: LlmModelControllerDeps):
    return controller.get_llm_models()


@router.post("/", response_model=LlmModel)
def add_model(
    user: CurrentUser, controller: LlmModelControllerDeps, body: LlmModelBase
):
    return controller.add_llm_model(body)


@router.patch("/{model_id}", response_model=LlmModel)
def update_model(user: CurrentUser, model_id: str, controller: LlmModelControllerDeps):
    return controller.update_llm_model()


@router.delete("/{model_id}", response_model=LlmModel)
def remove_model(user: CurrentUser, model_id: UUID, controller: LlmModelControllerDeps):
    return controller.remove_llm_model(model_id)
