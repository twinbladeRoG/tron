from uuid import UUID

from src.core.repository.base import BaseRepository
from src.models.models import ModelUsageLog
from src.modules.llm_models.controller import LlmModelController

from .schema import FilterParams


class ModelUsageLogRepository(BaseRepository[ModelUsageLog]):
    def get_user_logs(
        self,
        user_id: UUID,
        filter: FilterParams,
        *,
        llm_model_controller: LlmModelController,
    ):
        model = llm_model_controller.get_llm_model_by_name(filter.model_name)
        statement = self._query().where(
            ModelUsageLog.user_id == user_id, ModelUsageLog.model_id == model.id
        )
        if filter.from_date and filter.to_date:
            statement = statement.where(
                ModelUsageLog.created_at >= filter.from_date,
                ModelUsageLog.created_at <= filter.to_date,
            )
        return self.session.exec(statement).all()
