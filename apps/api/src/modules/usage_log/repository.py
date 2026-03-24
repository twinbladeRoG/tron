from uuid import UUID

from sqlmodel import func, select

from src.core.repository.base import BaseRepository
from src.models.models import LlmModel, ModelUsageLog
from src.models.pagination import get_pagination

from .schema import PaginatedFilterParams


class ModelUsageLogRepository(BaseRepository[ModelUsageLog]):
    def get_user_logs(
        self,
        user_id: UUID,
        query: PaginatedFilterParams,
        *,
        model: LlmModel,
    ):
        base_statement = self._query().where(
            ModelUsageLog.user_id == user_id, ModelUsageLog.model_id == model.id
        )
        count_statement = (
            select(func.count())
            .select_from(self.model_class)
            .where(ModelUsageLog.user_id == user_id, ModelUsageLog.model_id == model.id)
        )

        if query.from_date and query.to_date:
            base_statement = base_statement.where(
                ModelUsageLog.created_at >= query.from_date,
                ModelUsageLog.created_at <= query.to_date,
            )
            count_statement = count_statement.where(
                ModelUsageLog.created_at >= query.from_date,
                ModelUsageLog.created_at <= query.to_date,
            )

        if query.user_id:
            base_statement = base_statement.where(
                ModelUsageLog.user_id == query.user_id
            )
            count_statement = count_statement.where(
                ModelUsageLog.user_id == query.user_id
            )

        base_statement = base_statement.order_by(
            ModelUsageLog.created_at.desc(),  # type: ignore
            ModelUsageLog.id.desc(),  # type: ignore
        )

        statement = base_statement.offset(query.page * query.limit).limit(query.limit)
        logs = self.session.exec(statement).all()

        count = self.session.exec(count_statement).one()

        pagination = get_pagination(query.page, query.limit, count)

        return logs, pagination
