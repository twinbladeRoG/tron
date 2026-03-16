from functools import lru_cache
from typing import Annotated, Any, Iterable, Literal

from aiokafka import AIOKafkaProducer
from casbin.enforcer import Enforcer
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from pydantic import ValidationError
from qdrant_client import QdrantClient
from sqlmodel import Session

from src.core.exception import (
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
)
from src.core.kafka.dependencies import get_kafka_producer
from src.models.models import User
from src.modules.access_control.controller import PolicyController
from src.modules.agent.controller import AgentController
from src.modules.agent.rag.controller import RagAgentController
from src.modules.auth.controller import AuthController
from src.modules.auth.schema import TokenPayload
from src.modules.chat.controller import ChatController
from src.modules.conversation.controller import ConversationController
from src.modules.divisions.controller import DivisionController
from src.modules.features.controller import FeatureController
from src.modules.file_storage.controller import FileController
from src.modules.knowledge_base.controller import KnowledgeBaseController
from src.modules.llm_models.controller import LlmModelController
from src.modules.messages.controller import MessageController
from src.modules.organizations.controller import OrganizationController
from src.modules.scrapper.controller import ScrapeController
from src.modules.teams.controller import TeamController
from src.modules.token_usage.balance.controller import TokenBalanceController
from src.modules.token_usage.bucket.controller import TokenBucketController
from src.modules.token_usage.service import TokeUsageService
from src.modules.usage_log.controller import ModelUsageLogController
from src.modules.users.controller import UserController

from .access_control.casbin import get_casbin_enforcer
from .config import Settings
from .db import engine
from .jwt import JwtHandler
from .vector_db import vector_db_client


@lru_cache
def get_settings():
    return Settings()


SettingsDep = Annotated[Settings, Depends(get_settings)]


def get_database_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_database_session)]

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = JwtHandler.validate_token(token)
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError, ExpiredSignatureError):
        raise ForbiddenException("Could not validate credentials")

    user = session.get(User, token_data.sub)

    if not user:
        raise NotFoundException("User not found")

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_vector_database():
    return vector_db_client


VectorDatabaseDep = Annotated[QdrantClient, Depends(get_vector_database)]

CasbinEnforcerDeps = Annotated[Enforcer, Depends(get_casbin_enforcer)]

KafkaProducerDep = Annotated[AIOKafkaProducer, Depends(get_kafka_producer)]

# NOTE: Added here to avoid circular dependency
from .factory import Factory  # noqa: E402

UserControllerDeps = Annotated[UserController, Depends(Factory().get_user_controller)]
AuthControllerDeps = Annotated[AuthController, Depends(Factory().get_auth_controller)]
LlmModelControllerDeps = Annotated[
    LlmModelController, Depends(Factory().get_llm_model_controller)
]
ChatControllerDeps = Annotated[ChatController, Depends(Factory().get_chat_controller)]
ScrapeControllerDeps = Annotated[
    ScrapeController, Depends(Factory().get_scrape_controller)
]
AgentControllerDeps = Annotated[
    AgentController, Depends(Factory().get_agent_controller)
]
ModelUsageLogControllerDeps = Annotated[
    ModelUsageLogController, Depends(Factory().get_model_usage_log_controller)
]
ConversationControllerDeps = Annotated[
    ConversationController, Depends(Factory().get_conversation_controller)
]
MessageControllerDeps = Annotated[
    MessageController, Depends(Factory().get_message_controller)
]
PolicyControllerDeps = Annotated[
    PolicyController, Depends(Factory().get_policy_controller)
]
OrganizationControllerDeps = Annotated[
    OrganizationController, Depends(Factory().get_organization_controller)
]
DivisionControllerDeps = Annotated[
    DivisionController, Depends(Factory().get_division_controller)
]
TeamControllerDeps = Annotated[TeamController, Depends(Factory().get_team_controller)]
FeatureControllerDeps = Annotated[
    FeatureController, Depends(Factory().get_feature_controller)
]
FileControllerDeps = Annotated[FileController, Depends(Factory().get_file_controller)]
KnowledgeBaseControllerDeps = Annotated[
    KnowledgeBaseController, Depends(Factory().get_knowledge_base_controller)
]
RagAgentControllerDeps = Annotated[
    RagAgentController, Depends(Factory().get_rag_agent_controller)
]
TokeUsageServiceDeps = Annotated[
    TokeUsageService, Depends(Factory().get_token_usage_service)
]
TokenBucketControllerDeps = Annotated[
    TokenBucketController, Depends(Factory().get_token_bucker_controller)
]
TokenBalanceControllerDeps = Annotated[
    TokenBalanceController, Depends(Factory().get_token_balance_controller)
]


Rule = tuple[str, str] | str


class GuardChecker:
    def __init__(
        self,
        rules: Iterable[Rule],
        mode: Literal["ANY", "ALL"] = "ALL",
    ) -> None:
        self.rules = list(rules)
        self.mode = mode

    def __call__(self, user: CurrentUser, controller: PolicyControllerDeps) -> Any:
        results: list[bool] = []

        for rule in self.rules:
            if isinstance(rule, tuple):
                target, action = rule
            else:
                target = rule
                action = "view"

            try:
                result = controller.check_if_user_has_access(target, action, user=user)
                results.append(result.is_allowed)

                if self.mode == "ANY" and result.is_allowed:
                    return True

                if self.mode == "ALL" and not result.is_allowed:
                    raise UnauthorizedException(
                        "You are not authorized to access this!"
                    )
            except:
                raise UnauthorizedException("You are not authorized to access this!")

        if self.mode == "ALL":
            return True

        return True


def guard(*rules: Rule, mode: Literal["ANY", "ALL"] = "ALL"):
    return Depends(GuardChecker(rules, mode))
