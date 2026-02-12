from functools import lru_cache
from typing import Annotated

from casbin.enforcer import Enforcer
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from pydantic import ValidationError
from qdrant_client import QdrantClient
from sqlmodel import Session

from src.core.exception import ForbiddenException
from src.models.models import User
from src.modules.access_control.controller import PolicyController
from src.modules.agent.controller import AgentController
from src.modules.auth.controller import AuthController
from src.modules.auth.schema import TokenPayload
from src.modules.chat.controller import ChatController
from src.modules.conversation.controller import ConversationController
from src.modules.llm_models.controller import LlmModelController
from src.modules.messages.controller import MessageController
from src.modules.scrapper.controller import ScrapeController
from src.modules.usage_log.controller import ModelUsageLogController
from src.modules.users.controller import UserController

from .access_control.casbin import get_casbin_enforcer
from .access_control.types import Resource, Subject
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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    user = session.get(User, token_data.sub)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_vector_database():
    return vector_db_client


VectorDatabaseDep = Annotated[QdrantClient, Depends(get_vector_database)]

CasbinEnforcerDeps = Annotated[Enforcer, Depends(get_casbin_enforcer)]


def policy_enforcer(req: Request, enforcer: CasbinEnforcerDeps, me: CurrentUser):
    sub = Subject(id=1, org_id=2)
    obj = Resource(type="ai_agent", owner_id=1)
    act = "use"

    if enforcer.enforce(sub, obj, act):
        return True
    raise ForbiddenException("Action not allowed")


PolicyEnforcerDeps = Annotated[bool, Depends(policy_enforcer)]

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
