from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from src.core.dependencies import (
    ChatControllerDeps,
    # CurrentUser,
    LlmModelControllerDeps,
)

from .schema import ChatPayload

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/")
async def chat(
    # user: CurrentUser,
    controller: ChatControllerDeps,
    llm_model_controller: LlmModelControllerDeps,
    body: ChatPayload,
):
    return StreamingResponse(
        controller.chat(body, llm_model_controller=llm_model_controller),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        },
    )
