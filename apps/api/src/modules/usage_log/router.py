from typing import Annotated

from fastapi import APIRouter, Query

from src.core.dependencies import (
    CurrentUser,
    LlmModelControllerDeps,
    ModelUsageLogControllerDeps,
)
from src.models.pagination import ModelUsageLogPaginated

from .schema import PaginatedFilterParams

router = APIRouter(prefix="/usage-logs", tags=["Usage Logs"])


@router.get("/", response_model=ModelUsageLogPaginated)
def get_user_logs(
    user: CurrentUser,
    controller: ModelUsageLogControllerDeps,
    query: Annotated[PaginatedFilterParams, Query()],
    *,
    llm_model_controller: LlmModelControllerDeps,
):
    model = llm_model_controller.get_llm_model_by_name(query.model_name)
    logs, pagination = controller.get_usage_logs(user, query, model=model)
    return ModelUsageLogPaginated(data=logs, pagination=pagination)
