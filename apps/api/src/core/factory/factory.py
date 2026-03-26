from functools import partial

from src.core.dependencies import (
    CasbinEnforcerDeps,
    KafkaProducerDep,
    SessionDep,
    VectorDatabaseDep,
)
from src.models.models import (
    Conversation,
    Division,
    Feature,
    File,
    KnowledgeBase,
    LlmModel,
    Message,
    ModelUsageLog,
    Organization,
    Team,
    TokenBalance,
    TokenBucket,
    TokenLedger,
    TokenReservation,
    User,
)
from src.modules.access_control.controller import PolicyController
from src.modules.agent.browser_agent.controller import BrowserAgentController
from src.modules.agent.controller import AgentController
from src.modules.agent.rag.controller import RagAgentController
from src.modules.auth.controller import AuthController
from src.modules.chat.controller import ChatController
from src.modules.conversation.controller import ConversationController
from src.modules.conversation.repository import ConversationRepository
from src.modules.divisions.controller import DivisionController
from src.modules.divisions.repository import DivisionRepository
from src.modules.features.controller import FeatureController
from src.modules.features.repository import FeatureRepository
from src.modules.file_storage.controller import FileController
from src.modules.file_storage.repository import FileRepository
from src.modules.knowledge_base.controller import KnowledgeBaseController
from src.modules.knowledge_base.repository import KnowledgeBaseRepository
from src.modules.llm_models.controller import LlmModelController
from src.modules.llm_models.repository import LlmModelRepository
from src.modules.messages.controller import MessageController
from src.modules.messages.repository import MessageRepository
from src.modules.organizations.controller import OrganizationController
from src.modules.organizations.repository import OrganizationRepository
from src.modules.scrapper.controller import ScrapeController
from src.modules.teams.controller import TeamController
from src.modules.teams.repository import TeamRepository
from src.modules.token_usage.balance.controller import TokenBalanceController
from src.modules.token_usage.balance.repository import TokenBalanceRepository
from src.modules.token_usage.bucket.controller import TokenBucketController
from src.modules.token_usage.bucket.repository import TokenBucketRepository
from src.modules.token_usage.ledger.repository import TokenLedgerRepository
from src.modules.token_usage.reservation.repository import TokenReservationRepository
from src.modules.token_usage.service import TokeUsageService
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
    feature_repository = partial(FeatureRepository, Feature)
    file_repository = partial(FileRepository, File)
    knowledge_base_repository = partial(KnowledgeBaseRepository, KnowledgeBase)
    token_balance_repository = partial(TokenBalanceRepository, TokenBalance)
    token_ledger_repository = partial(TokenLedgerRepository, TokenLedger)
    token_bucket_repository = partial(TokenBucketRepository, TokenBucket)
    token_reservation_repository = partial(TokenReservationRepository, TokenReservation)

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

    def get_feature_controller(self, db_session: SessionDep):
        return FeatureController(repository=self.feature_repository(session=db_session))

    def get_file_controller(self, db_session: SessionDep):
        return FileController(repository=self.file_repository(session=db_session))

    def get_knowledge_base_controller(
        self,
        db_session: SessionDep,
        vector_db: VectorDatabaseDep,
        kafka_producer: KafkaProducerDep,
    ):
        return KnowledgeBaseController(
            repository=self.knowledge_base_repository(session=db_session),
            vector_db=vector_db,
            kafka_producer=kafka_producer,
        )

    def get_rag_agent_controller(self):
        return RagAgentController()

    def get_token_usage_service(self, db_session: SessionDep):
        return TokeUsageService(
            token_balance_repository=self.token_balance_repository(session=db_session),
            token_bucket_repository=self.token_bucket_repository(session=db_session),
            token_ledger_repository=self.token_ledger_repository(session=db_session),
            token_reservation_repository=self.token_reservation_repository(
                session=db_session
            ),
            llm_model_repository=self.llm_models_repository(session=db_session),
        )

    def get_token_bucker_controller(self, db_session: SessionDep):
        return TokenBucketController(
            repository=self.token_bucket_repository(session=db_session)
        )

    def get_token_balance_controller(self, db_session: SessionDep):
        return TokenBalanceController(
            repository=self.token_balance_repository(session=db_session)
        )

    def get_browser_agent_controller(self):
        return BrowserAgentController()
