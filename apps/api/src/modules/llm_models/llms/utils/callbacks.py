import threading
from contextlib import contextmanager
from contextvars import ContextVar
from typing import (
    Any,
    Generator,
    Optional,
)
from uuid import UUID

from langchain_community.callbacks.openai_info import (
    MODEL_COST_PER_1K_TOKENS,
    TokenType,
    get_openai_token_cost_for_model,
    standardize_model_name,
)
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.messages import AIMessage
from langchain_core.outputs import ChatGeneration, LLMResult
from langchain_core.tracers.context import register_configure_hook
from sqlmodel import Session

from src.models.models import Conversation, LlmModel, Message, ModelUsageLog, User
from src.modules.conversation.controller import ConversationController
from src.modules.messages.controller import MessageController
from src.modules.messages.schema import MessageBase
from src.modules.usage_log.controller import ModelUsageLogController
from src.modules.usage_log.schema import ModelUsageLogBase
from src.utils.time import utcnow


class LlmUsageCallbackHandler(BaseCallbackHandler):
    """Callback Handler that tracks LLM info."""

    usage_log: ModelUsageLogBase = ModelUsageLogBase()

    raise_error = True

    def __init__(
        self,
        user: User,
        session: Session,
        model: LlmModel,
        conversation: Conversation,
        *,
        model_usage_log_controller: ModelUsageLogController,
        conversation_controller: ConversationController,
        message_controller: MessageController,
    ) -> None:
        super().__init__()
        self._lock = threading.Lock()
        self.session = session
        self.user = user
        self.model = model
        self.conversation = conversation
        self.model_usage_log_controller = model_usage_log_controller
        self.conversation_controller = conversation_controller
        self.message_controller = message_controller
        self.llm_message: Message | None = None
        self.usage_logs: list[dict] = []

    def __repr__(self) -> str:
        return (
            f"Tokens Used: {self.usage_log.total_tokens}\n"
            f"\tPrompt Tokens: {self.usage_log.prompt_tokens}\n"
            f"\t\tPrompt Tokens Cached: {self.usage_log.prompt_tokens_cached}\n"
            f"\tCompletion Tokens: {self.usage_log.completion_tokens}\n"
            f"\t\tReasoning Tokens: {self.usage_log.reasoning_tokens}\n"
            f"Successful Requests: {self.usage_log.successful_requests}\n"
            f"Total Cost (USD): ${self.usage_log.total_cost}\n"
            f"Total Time: {self.usage_log.time} seconds"
        )

    def get_current_usage(self):
        return self.usage_log

    def get_cumulative_usage(self):
        usage_log = ModelUsageLogBase()

        for log in self.usage_logs:
            current_log = ModelUsageLog(**log)
            usage_log.total_cost += current_log.total_cost
            usage_log.total_tokens += current_log.total_tokens
            usage_log.prompt_tokens += current_log.prompt_tokens
            usage_log.prompt_tokens_cached += current_log.prompt_tokens_cached
            usage_log.completion_tokens += current_log.completion_tokens
            usage_log.reasoning_tokens += current_log.reasoning_tokens
            usage_log.time += current_log.time
            usage_log.successful_requests = 1

        return usage_log

    def on_llm_start(
        self,
        serialized: dict[str, Any],
        prompts: list[str],
        *,
        run_id: UUID,
        parent_run_id: UUID | None = None,
        tags: list[str] | None = None,
        metadata: dict[str, Any] | None = None,
        **kwargs: Any,
    ) -> Any:
        with self._lock:
            self.usage_log = ModelUsageLogBase()
            self.usage_log.start_time = utcnow()

    def on_llm_end(
        self,
        response: LLMResult,
        *,
        run_id: UUID,
        parent_run_id: UUID | None = None,
        **kwargs: Any,
    ) -> Any:
        try:
            generation = response.generations[0][0]
        except IndexError:
            generation = None

        if isinstance(generation, ChatGeneration):
            try:
                message = generation.message
                if isinstance(message, AIMessage):
                    usage_metadata = message.usage_metadata
                    response_metadata = message.response_metadata

                    # For Agent end message
                    if message.response_metadata.get("finish_reason", None) == "stop":
                        self.llm_message = self.message_controller.upsert_message(
                            data=MessageBase(
                                type="ai",
                                content=str(message.content),
                                reason=message.additional_kwargs.get(
                                    "reasoning_content", None
                                ),
                                run_id=run_id,
                            ),
                            user=self.user,
                            conversation=self.conversation,
                            model=self.model,
                            previous_message=self.llm_message,
                        )

                    # For Agent toll call message
                    elif (
                        message.response_metadata.get("finish_reason", None)
                        == "tool_calls"
                    ):
                        self.llm_message = self.message_controller.upsert_message(
                            data=MessageBase(
                                type="ai",
                                content=str(message.content),
                                reason=message.additional_kwargs.get(
                                    "reasoning_content", None
                                ),
                                run_id=run_id,
                                tool_calls=message.tool_calls,  # type: ignore
                            ),
                            user=self.user,
                            conversation=self.conversation,
                            model=self.model,
                            previous_message=self.llm_message,
                        )

                else:
                    usage_metadata = None
                    response_metadata = None
            except AttributeError:
                usage_metadata = None
                response_metadata = None
        else:
            usage_metadata = None
            response_metadata = None

        prompt_tokens_cached = 0
        reasoning_tokens = 0

        if usage_metadata:
            token_usage = {"total_tokens": usage_metadata["total_tokens"]}
            completion_tokens = usage_metadata["output_tokens"]
            prompt_tokens = usage_metadata["input_tokens"]

            if response_model_name := (response_metadata or {}).get("model_name"):
                model_name = standardize_model_name(response_model_name)
            elif response.llm_output is None:
                model_name = ""
            else:
                model_name = standardize_model_name(
                    response.llm_output.get("model_name", "")
                )

            if "cache_read" in usage_metadata.get("input_token_details", {}):
                prompt_tokens_cached = usage_metadata.get(
                    "input_token_details", {}
                ).get("cache_read", 0)
            if "reasoning" in usage_metadata.get("output_token_details", {}):
                reasoning_tokens = usage_metadata.get("output_token_details", {}).get(
                    "reasoning", 0
                )
        else:
            if response.llm_output is None:
                return None

            if "token_usage" not in response.llm_output:
                with self._lock:
                    self.successful_requests += 1
                return None

            # compute tokens and cost for this request
            token_usage = response.llm_output["token_usage"]
            completion_tokens = token_usage.get("completion_tokens", 0)
            prompt_tokens = token_usage.get("prompt_tokens", 0)
            model_name = standardize_model_name(
                response.llm_output.get("model_name", "")
            )

        if model_name in MODEL_COST_PER_1K_TOKENS:
            uncached_prompt_tokens = prompt_tokens - prompt_tokens_cached
            uncached_prompt_cost = get_openai_token_cost_for_model(
                model_name, uncached_prompt_tokens, token_type=TokenType.PROMPT
            )
            cached_prompt_cost = get_openai_token_cost_for_model(
                model_name, prompt_tokens_cached, token_type=TokenType.PROMPT_CACHED
            )
            prompt_cost = uncached_prompt_cost + cached_prompt_cost
            completion_cost = get_openai_token_cost_for_model(
                model_name, completion_tokens, token_type=TokenType.COMPLETION
            )
        else:
            completion_cost = 0
            prompt_cost = 0

        with self._lock:
            self.usage_log.total_cost += prompt_cost + completion_cost
            self.usage_log.total_tokens += token_usage.get("total_tokens", 0)
            self.usage_log.prompt_tokens += prompt_tokens
            self.usage_log.prompt_tokens_cached += prompt_tokens_cached
            self.usage_log.completion_tokens += completion_tokens
            self.usage_log.reasoning_tokens += reasoning_tokens
            self.usage_log.successful_requests += 1
            self.usage_log.end_time = utcnow()

            if (
                self.usage_log.start_time is not None
                and self.usage_log.end_time is not None
            ):
                self.usage_log.time = (
                    self.usage_log.end_time - self.usage_log.start_time
                ).total_seconds()

            # Log usage to database
            if self.llm_message is not None:
                model_usage_log = self.model_usage_log_controller.log(
                    self.usage_log,
                    user=self.user,
                    model=self.model,
                    conversation=self.conversation,
                    message=self.llm_message,
                )
                self.usage_logs.append(model_usage_log.model_dump())


llm_callback_var: ContextVar[Optional[LlmUsageCallbackHandler]] = ContextVar(
    "llm_callback", default=None
)

register_configure_hook(llm_callback_var, True)


@contextmanager
def get_llm_callback(
    user: User,
    session: Session,
    model: LlmModel,
    conversation: Conversation,
    *,
    model_usage_log_controller: ModelUsageLogController,
    conversation_controller: ConversationController,
    message_controller: MessageController,
) -> Generator[LlmUsageCallbackHandler, None, None]:
    """Get the LLM callback handler in a context manager.
    which conveniently exposes token and cost information.

    Returns:
        LLMCallbackHandler: The OpenAI callback handler.

    Example:
        >>> with get_llm_callback() as cb:
        ...     # Use the OpenAI callback handler
    """
    cb = LlmUsageCallbackHandler(
        user,
        session,
        model,
        conversation,
        model_usage_log_controller=model_usage_log_controller,
        conversation_controller=conversation_controller,
        message_controller=message_controller,
    )
    llm_callback_var.set(cb)
    yield cb
    llm_callback_var.set(None)
