from fastapi import APIRouter

from src.modules.auth.router import router as auth_router
from src.modules.chat.router import router as chat_router
from src.modules.llm_models.router import router as llm_models_router
from src.modules.scrapper.router import router as scrapper_router
from src.modules.users.router import router as user_router

router = APIRouter()

router.include_router(user_router)
router.include_router(auth_router)
router.include_router(llm_models_router)
router.include_router(chat_router)
router.include_router(scrapper_router)
