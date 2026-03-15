from uuid import UUID

from fastapi import APIRouter

from src.core.dependencies import (
    CurrentUser,
    LlmModelControllerDeps,
    PolicyControllerDeps,
)
from src.models.models import LlmModel
from src.models.response import LlmModelWithAccess

from .schema import LlmModelBase

router = APIRouter(prefix="/llm-models", tags=["LLM Models"])


@router.get("/", response_model=list[LlmModelWithAccess])
def get_models(
    user: CurrentUser,
    controller: LlmModelControllerDeps,
    policy_controller: PolicyControllerDeps,
):
    llm_models = controller.get_llm_models()
    models: list[LlmModelWithAccess] = []

    for model in llm_models:
        try:
            has_access = policy_controller.check_if_user_has_access(
                f"model:{model.name}", "view", user=user
            ).is_allowed
        except:
            has_access = False

        models.append(LlmModelWithAccess(**model.model_dump(), has_access=has_access))

    return models


@router.get("/{model_identifier}", response_model=LlmModel)
def get_model(
    user: CurrentUser, controller: LlmModelControllerDeps, model_identifier: str
):
    return controller.get_model(model_identifier)


@router.post("/", response_model=LlmModel)
def add_model(
    user: CurrentUser,
    controller: LlmModelControllerDeps,
    body: LlmModelBase,
):
    return controller.add_llm_model(body)


@router.patch("/{model_id}", response_model=LlmModel)
def update_model(user: CurrentUser, model_id: str, controller: LlmModelControllerDeps):
    return controller.update_llm_model()


@router.delete("/{model_id}", response_model=LlmModel)
def remove_model(user: CurrentUser, model_id: UUID, controller: LlmModelControllerDeps):
    return controller.remove_llm_model(model_id)
