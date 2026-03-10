from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from src.core.dependencies import (
    ConversationControllerDeps,
    CurrentUser,
    FileControllerDeps,
    KnowledgeBaseControllerDeps,
    LlmModelControllerDeps,
    MessageControllerDeps,
    ModelUsageLogControllerDeps,
    RagAgentControllerDeps,
    SessionDep,
)

from ..schema import AgentWorkflowResponse
from .schema import RagChatPayload

router = APIRouter(prefix="/rag", tags=["RAG Agent"])


@router.post("/")
async def chat(
    user: CurrentUser,
    controller: RagAgentControllerDeps,
    body: RagChatPayload,
    *,
    llm_model_controller: LlmModelControllerDeps,
    model_usage_log_controller: ModelUsageLogControllerDeps,
    conversation_controller: ConversationControllerDeps,
    message_controller: MessageControllerDeps,
    knowledge_base_controller: KnowledgeBaseControllerDeps,
    file_controller: FileControllerDeps,
    session: SessionDep,
):
    return StreamingResponse(
        controller.chat(
            body,
            user=user,
            session=session,
            llm_model_controller=llm_model_controller,
            model_usage_log_controller=model_usage_log_controller,
            conversation_controller=conversation_controller,
            message_controller=message_controller,
            knowledge_base_controller=knowledge_base_controller,
            file_controller=file_controller,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        },
    )


@router.get("/workflow/{model}", response_model=AgentWorkflowResponse)
def get_workflow(
    user: CurrentUser,
    controller: RagAgentControllerDeps,
    model: str,
    *,
    llm_model_controller: LlmModelControllerDeps,
):
    state, mermaid = controller.get_agent_workflow(
        model,
        llm_model_controller=llm_model_controller,
    )
    return AgentWorkflowResponse(mermaid=mermaid, state=state)
