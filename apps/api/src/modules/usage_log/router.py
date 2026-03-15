from typing import Annotated

from fastapi import APIRouter, Depends, Query

from src.core.dependencies import (
    CurrentUser,
    Guard,
    LlmModelControllerDeps,
    ModelUsageLogControllerDeps,
)
from src.models.models import ModelUsageLog

from .schema import FilterParams

router = APIRouter(prefix="/usage-logs", tags=["Usage Logs"])


@router.get(
    "/",
    response_model=list[ModelUsageLog],
    dependencies=[Depends(Guard("feature:model-usage", "view"))],
)
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
