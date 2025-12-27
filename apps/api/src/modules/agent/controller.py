import json
from dataclasses import dataclass
from uuid import UUID, uuid4

from langchain.agents import create_agent
from langchain.messages import AIMessageChunk, HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import InMemorySaver
from sqlmodel import Session

from src.core.logger import logger
from src.models.models import User
from src.modules.llm_models.controller import LlmModelController
from src.modules.llm_models.llms.utils.callbacks import get_llm_callback
from src.modules.usage_log.controller import ModelUsageLogController

from .schema import ChatPayload
from .tools import get_current_time, get_webpage_content

checkpointer = InMemorySaver()


@dataclass
class Context:
    """Custom runtime context schema."""

    user_id: UUID


class AgentController:
    def __init__(self) -> None:
        pass

    def get_agent(self, model: str, *, llm_model_controller: LlmModelController):
        llm_model = llm_model_controller.get_llm_model_by_name(model)
        chat_model = llm_model_controller.get_chat_model(llm_model)

        agent = create_agent(
            chat_model,
            tools=[get_current_time, get_webpage_content],
            checkpointer=checkpointer,
            system_prompt="You are a helpful assistant",
            context_schema=Context,
        )

        return agent, llm_model

    def get_agent_workflow(
        self, model: str, *, llm_model_controller: LlmModelController
    ):
        llm_model = llm_model_controller.get_llm_model_by_name(model)
        chat_model = llm_model_controller.get_chat_model(llm_model)

        agent = create_agent(
            chat_model,
            tools=[get_current_time, get_webpage_content],
            checkpointer=checkpointer,
            system_prompt="You are a helpful assistant",
            context_schema=Context,
            name="ai-agent",
        )

        mermaid = agent.get_graph(xray=True).draw_mermaid()
        state = agent.get_graph(xray=True).to_json()

        return state, mermaid

    async def chat(
        self,
        data: ChatPayload,
        *,
        user: User,
        session: Session,
        llm_model_controller: LlmModelController,
        model_usage_log_controller: ModelUsageLogController,
    ):
        conversation_id = data.conversation_id if data.conversation_id else uuid4()
        yield f"event: conversationId\ndata: {conversation_id.hex}\n\n"

        try:
            agent, llm_model = self.get_agent(
                data.model, llm_model_controller=llm_model_controller
            )

            with get_llm_callback(
                user,
                session,
                llm_model,
                model_usage_log_controller=model_usage_log_controller,
            ) as cb:
                async for mode, event in agent.astream(
                    input={"messages": [HumanMessage(content=data.message)]},
                    stream_mode=["messages", "updates"],
                    context=Context(user_id=user.id),
                    config=RunnableConfig(
                        configurable={"thread_id": conversation_id.hex}
                    ),
                ):
                    state = agent.get_state(
                        config=RunnableConfig(
                            configurable={"thread_id": conversation_id.hex}
                        )
                    )

                    if len(state.next) != 0:
                        for node in state.next:
                            yield f"event: node\ndata: {node}\n\n"

                    if mode == "updates":
                        if isinstance(event, dict):
                            nodes = list(event.keys())
                            if len(nodes) > 0:
                                node = nodes[0]
                                yield f"event: node\ndata: {node}\n\n"

                    if mode == "messages":
                        message = event[0]
                        if isinstance(message, AIMessageChunk):
                            if len(message.tool_calls) > 0:
                                for tool_call in message.tool_calls:
                                    tool_name = tool_call.get("name")
                                    if tool_name:
                                        tools_details = {
                                            "name": tool_name,
                                            "id": tool_call.get("id"),
                                            "type": tool_call.get("type"),
                                        }
                                        yield f"event: tool_call\ndata: {json.dumps(tools_details)}\n\n"

                            reason = message.additional_kwargs.get("reasoning_content")
                            if reason:
                                yield f"event: reason\ndata: {json.dumps({'text': reason})}\n\n"

                            content = message.content
                            if content:
                                yield f"event: message\ndata: {json.dumps({'text': content})}\n\n"

                yield f"event: usage\ndata: {cb.get_usage().model_dump_json()}\n\n"

        except Exception as e:
            logger.error(e)
            yield f"event: error\ndata: {e}\n\n"
        finally:
            yield "event: done\ndata: end\n\n"
