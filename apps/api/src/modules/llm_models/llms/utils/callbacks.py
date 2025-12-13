import threading
from contextlib import contextmanager
from contextvars import ContextVar
from datetime import datetime
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
from pydantic import BaseModel
from sqlmodel import Session

from src.utils.time import utcnow


class LlmUsage(BaseModel):
    total_tokens: int = 0
    prompt_tokens: int = 0
    prompt_tokens_cached: int = 0
    completion_tokens: int = 0
    reasoning_tokens: int = 0
    successful_requests: int = 0
    total_cost: float = 0.0
    _start_time: datetime | None = None
    _end_time: datetime | None = None
    time: float = 0


class LlmUsageCallbackHandler(BaseCallbackHandler):
    """Callback Handler that tracks LLM info."""

    total_tokens: int = 0
    prompt_tokens: int = 0
    prompt_tokens_cached: int = 0
    completion_tokens: int = 0
    reasoning_tokens: int = 0
    successful_requests: int = 0
    total_cost: float = 0.0
    _start_time: datetime | None = None
    _end_time: datetime | None = None
    time: float = 0

    raise_error = True

    def __init__(self, session: Session) -> None:
        super().__init__()
        self._lock = threading.Lock()
        self.session = session

    def __repr__(self) -> str:
        return (
            f"Tokens Used: {self.total_tokens}\n"
            f"\tPrompt Tokens: {self.prompt_tokens}\n"
            f"\t\tPrompt Tokens Cached: {self.prompt_tokens_cached}\n"
            f"\tCompletion Tokens: {self.completion_tokens}\n"
            f"\t\tReasoning Tokens: {self.reasoning_tokens}\n"
            f"Successful Requests: {self.successful_requests}\n"
            f"Total Cost (USD): ${self.total_cost}\n"
            f"Total Time: {self.time} seconds"
        )

    def get_usage(self) -> LlmUsage:
        return LlmUsage(
            total_tokens=self.total_tokens,
            prompt_tokens=self.prompt_tokens,
            prompt_tokens_cached=self.prompt_tokens_cached,
            completion_tokens=self.completion_tokens,
            reasoning_tokens=self.reasoning_tokens,
            successful_requests=self.successful_requests,
            total_cost=self.total_cost,
            _start_time=self._start_time,
            _end_time=self._end_time,
            time=self.time,
        )

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
            self._start_time = utcnow()

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
            self.total_cost += prompt_cost + completion_cost
            self.total_tokens += token_usage.get("total_tokens", 0)
            self.prompt_tokens += prompt_tokens
            self.prompt_tokens_cached += prompt_tokens_cached
            self.completion_tokens += completion_tokens
            self.reasoning_tokens += reasoning_tokens
            self.successful_requests += 1
            self._end_time = utcnow()
            if self._start_time is not None and self._end_time is not None:
                self.time = (self._end_time - self._start_time).total_seconds()


llm_callback_var: ContextVar[Optional[LlmUsageCallbackHandler]] = ContextVar(
    "llm_callback", default=None
)

register_configure_hook(llm_callback_var, True)


@contextmanager
def get_llm_callback(
    session: Session,
) -> Generator[LlmUsageCallbackHandler, None, None]:
    """Get the LLM callback handler in a context manager.
    which conveniently exposes token and cost information.

    Returns:
        LLMCallbackHandler: The OpenAI callback handler.

    Example:
        >>> with get_llm_callback() as cb:
        ...     # Use the OpenAI callback handler
    """
    cb = LlmUsageCallbackHandler(session)
    llm_callback_var.set(cb)
    yield cb
    llm_callback_var.set(None)
