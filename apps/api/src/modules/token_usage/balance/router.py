from uuid import UUID

from fastapi import APIRouter

from src.core.dependencies import (
    CurrentUser,
    LlmModelControllerDeps,
    TokenBalanceControllerDeps,
)
from src.models.models import TokenBalance

router = APIRouter(prefix="/token-balance", tags=["Token Balance"])


@router.get("/model/{model_id}", response_model=list[TokenBalance])
def get_user_buckets(
    user: CurrentUser,
    model_id: UUID,
    controller: TokenBalanceControllerDeps,
    llm_model_controller: LlmModelControllerDeps,
):
    llm_model_controller.get_by_id(id=model_id)
    return controller.get_balance_by_model(user, model_id)
