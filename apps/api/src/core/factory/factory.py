from functools import partial

from src.core.dependencies import SessionDep
from src.models.models import LlmModel, ModelUsageLog, User
from src.modules.agent.controller import AgentController
from src.modules.auth.controller import AuthController
from src.modules.chat.controller import ChatController
from src.modules.llm_models.controller import LlmModelController
from src.modules.llm_models.repository import LlmModelRepository
from src.modules.scrapper.controller import ScrapeController
from src.modules.usage_log.controller import ModelUsageLogController
from src.modules.usage_log.repository import ModelUsageLogRepository
from src.modules.users.controller import UserController
from src.modules.users.repository import UserRepository


class Factory:
    user_repository = partial(UserRepository, User)
    llm_models_repository = partial(LlmModelRepository, LlmModel)
    model_usage_log_repository = partial(ModelUsageLogRepository, ModelUsageLog)

    def get_user_controller(self, db_session: SessionDep):
        return UserController(repository=self.user_repository(session=db_session))

    def get_auth_controller(self, db_session: SessionDep):
        return AuthController(repository=self.user_repository(session=db_session))

    def get_llm_model_controller(self, db_session: SessionDep):
        return LlmModelController(
            repository=self.llm_models_repository(session=db_session)
        )

    def get_chat_controller(self, db_session: SessionDep):
        return ChatController(session=db_session)

    def get_scrape_controller(self, db_session: SessionDep):
        return ScrapeController(session=db_session)

    def get_agent_controller(self):
        return AgentController()

    def get_model_usage_log_controller(self, db_session: SessionDep):
        return ModelUsageLogController(
            repository=self.model_usage_log_repository(session=db_session)
        )
