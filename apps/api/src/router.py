from fastapi import APIRouter

from src.modules.access_control.router import router as access_control_router
from src.modules.agent.router import router as agent_router
from src.modules.auth.router import router as auth_router
from src.modules.chat.router import router as chat_router
from src.modules.conversation.router import router as conversation_router
from src.modules.divisions.router import router as division_router
from src.modules.llm_models.router import router as llm_models_router
from src.modules.messages.router import router as message_router
from src.modules.organizations.router import router as organization_router
from src.modules.scrapper.router import router as scrapper_router
from src.modules.teams.router import router as team_router
from src.modules.usage_log.router import router as usage_log_router
from src.modules.users.router import router as user_router

router = APIRouter()

router.include_router(user_router)
router.include_router(auth_router)
router.include_router(llm_models_router)
router.include_router(chat_router)
router.include_router(scrapper_router)
router.include_router(agent_router)
router.include_router(usage_log_router)
router.include_router(conversation_router)
router.include_router(message_router)
router.include_router(access_control_router)
router.include_router(organization_router)
router.include_router(division_router)
router.include_router(team_router)
