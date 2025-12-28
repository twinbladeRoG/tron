from typing import Annotated

from fastapi import APIRouter, Query

from src.core.dependencies import (
    CurrentUser,
    LlmModelControllerDeps,
    ModelUsageLogControllerDeps,
)
from src.models.models import ModelUsageLog

from .schema import FilterParams

router = APIRouter(prefix="/usage-logs", tags=["Usage Logs"])


@router.get("/", response_model=list[ModelUsageLog])
def get_user_logs(
    user: CurrentUser,
    controller: ModelUsageLogControllerDeps,
    query: Annotated[FilterParams, Query()],
    *,
    llm_model_controller: LlmModelControllerDeps,
):
    return controller.get_usage_logs(
        user, query, llm_model_controller=llm_model_controller
    )
