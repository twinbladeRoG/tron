from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from src.core.dependencies import (
    AgentControllerDeps,
    CurrentUser,
    LlmModelControllerDeps,
    ModelUsageLogControllerDeps,
    SessionDep,
)

from .schema import AgentWorkflowResponse, ChatPayload

router = APIRouter(prefix="/agent", tags=["Agent"])


@router.post("/")
async def chat(
    user: CurrentUser,
    controller: AgentControllerDeps,
    body: ChatPayload,
    *,
    llm_model_controller: LlmModelControllerDeps,
    model_usage_log_controller: ModelUsageLogControllerDeps,
    session: SessionDep,
):
    return StreamingResponse(
        controller.chat(
            body,
            user=user,
            llm_model_controller=llm_model_controller,
            model_usage_log_controller=model_usage_log_controller,
            session=session,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        },
    )


@router.get("/workflow/{model}")
def get_workflow(
    user: CurrentUser,
    controller: AgentControllerDeps,
    model: str,
    *,
    llm_model_controller: LlmModelControllerDeps,
):
    state, mermaid = controller.get_agent_workflow(
        model,
        llm_model_controller=llm_model_controller,
    )
    return AgentWorkflowResponse(mermaid=mermaid, state=state)
