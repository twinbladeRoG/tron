from src.core.controller.base import BaseController
from src.models.models import Conversation, LlmModel, Message, ModelUsageLog, User

from .repository import ModelUsageLogRepository
from .schema import CreateModelUsageLog, ModelUsageLogBase, PaginatedFilterParams


class ModelUsageLogController(BaseController[ModelUsageLog]):
    def __init__(self, repository: ModelUsageLogRepository) -> None:
        super().__init__(model=ModelUsageLog, repository=repository)
        self.repository = repository

    def log(
        self,
        data: ModelUsageLogBase,
        *,
        user: User,
        model: LlmModel,
        conversation: Conversation,
        message: Message,
    ):
        payload = CreateModelUsageLog(
            **data.model_dump(),
            user_id=user.id,
            model_id=model.id,
            conversation_id=conversation.id,
            message_id=message.id,
        )
        usage_log = ModelUsageLog.model_validate(payload.model_dump())
        self.repository.session.add(usage_log)
        self.repository.session.flush()
        self.repository.session.refresh(usage_log)
        return usage_log

    def get_usage_logs(
        self, user: User, filter: PaginatedFilterParams, *, model: LlmModel
    ):
        return self.repository.get_user_logs(user.id, filter, model=model)
