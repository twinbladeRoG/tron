from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from src.core.dependencies import BrowserAgentControllerDeps, CurrentUser

from .schema import ChatPayload

router = APIRouter(prefix="/browser-agent", tags=["Browser Agent"])


@router.post("/")
async def chat(
    user: CurrentUser, controller: BrowserAgentControllerDeps, body: ChatPayload
):
    return StreamingResponse(
        controller.chat(body.task),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        },
    )
