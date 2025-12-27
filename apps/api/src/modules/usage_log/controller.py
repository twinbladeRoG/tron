from src.core.controller.base import BaseController
from src.models.models import LlmModel, ModelUsageLog, User
from src.modules.llm_models.controller import LlmModelController

from .repository import ModelUsageLogRepository
from .schema import CreateModelUsageLog, FilterParams, ModelUsageLogBase


class ModelUsageLogController(BaseController[ModelUsageLog]):
    def __init__(self, repository: ModelUsageLogRepository) -> None:
        super().__init__(model=ModelUsageLog, repository=repository)
        self.repository = repository

    def log(self, data: ModelUsageLogBase, user: User, model: LlmModel):
        payload = CreateModelUsageLog(
            **data.model_dump(), user_id=user.id, model_id=model.id
        )
        return self.repository.create(payload.model_dump())

    def get_usage_logs(
        self,
        user: User,
        filter: FilterParams,
        *,
        llm_model_controller: LlmModelController,
    ):
        return self.repository.get_user_logs(
            user.id, filter, llm_model_controller=llm_model_controller
        )
