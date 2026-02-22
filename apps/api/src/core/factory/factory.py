from functools import partial

from src.core.dependencies import CasbinEnforcerDeps, SessionDep
from src.models.models import (
    Conversation,
    Division,
    LlmModel,
    Message,
    ModelUsageLog,
    Organization,
    Team,
    User,
)
from src.modules.access_control.controller import PolicyController
from src.modules.agent.controller import AgentController
from src.modules.auth.controller import AuthController
from src.modules.chat.controller import ChatController
from src.modules.conversation.controller import ConversationController
from src.modules.conversation.repository import ConversationRepository
from src.modules.divisions.controller import DivisionController
from src.modules.divisions.repository import DivisionRepository
from src.modules.llm_models.controller import LlmModelController
from src.modules.llm_models.repository import LlmModelRepository
from src.modules.messages.controller import MessageController
from src.modules.messages.repository import MessageRepository
from src.modules.organizations.controller import OrganizationController
from src.modules.organizations.repository import OrganizationRepository
from src.modules.scrapper.controller import ScrapeController
from src.modules.teams.controller import TeamController
from src.modules.teams.repository import TeamRepository
from src.modules.usage_log.controller import ModelUsageLogController
from src.modules.usage_log.repository import ModelUsageLogRepository
from src.modules.users.controller import UserController
from src.modules.users.repository import UserRepository


class Factory:
    user_repository = partial(UserRepository, User)
    llm_models_repository = partial(LlmModelRepository, LlmModel)
    model_usage_log_repository = partial(ModelUsageLogRepository, ModelUsageLog)
    conversation_repository = partial(ConversationRepository, Conversation)
    message_repository = partial(MessageRepository, Message)
    organization_repository = partial(OrganizationRepository, Organization)
    division_repository = partial(DivisionRepository, Division)
    team_repository = partial(TeamRepository, Team)

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

    def get_conversation_controller(self, db_session: SessionDep):
        return ConversationController(
            repository=self.conversation_repository(session=db_session)
        )

    def get_message_controller(self, db_session: SessionDep):
        return MessageController(repository=self.message_repository(session=db_session))

    def get_policy_controller(self, enforcer: CasbinEnforcerDeps):
        return PolicyController(enforcer=enforcer)

    def get_organization_controller(self, db_session: SessionDep):
        return OrganizationController(
            repository=self.organization_repository(session=db_session)
        )

    def get_division_controller(self, db_session: SessionDep):
        return DivisionController(
            repository=self.division_repository(session=db_session)
        )

    def get_team_controller(self, db_session: SessionDep):
        return TeamController(repository=self.team_repository(session=db_session))
