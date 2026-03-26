from fastapi import APIRouter

from src.core.dependencies import BrowserAgentControllerDeps, CurrentUser

from .schema import ChatPayload

router = APIRouter(prefix="/browser-agent", tags=["Browser Agent"])


@router.post("/")
def chat(user: CurrentUser, controller: BrowserAgentControllerDeps, body: ChatPayload):
    return controller.chat(body.task)
