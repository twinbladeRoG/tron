from typing import Any

from src.modules.llm_models.llms.schema import (
    AWSBedrockChatModelParams,
    GoogleGeminiChatModelParams,
    OpenAICompliantChatModelParams,
)


def get_openai_style_model_params(
    model_params: OpenAICompliantChatModelParams,
) -> dict[str, Any]:
    llm_params: dict[str, Any] = {
        "temperature": model_params.temperature,
        "timeout": model_params.timeout,
        "max_retries": model_params.max_retries,
        "max_tokens": model_params.max_tokens,
        "stream_usage": model_params.stream_usage,
    }

    if model_params.thinking_level is not None:
        # Reasoning parameters for reasoning models. For use with the Responses API.
        llm_params["reasoning"] = {
            "effort": model_params.thinking_level,
            "summary": "auto",  # Can be "auto", "concise", or "detailed"
        }
        # Constrains effort on reasoning for reasoning models. For use with the Chat Completions API.
        llm_params["reasoning_effort"] = model_params.thinking_level

    return llm_params


def get_google_model_params(
    model_params: GoogleGeminiChatModelParams,
) -> dict[str, Any]:
    return {
        "temperature": model_params.temperature,
        "max_tokens": model_params.max_tokens,
        "request_timeout": model_params.timeout,
        "retries": model_params.max_retries,
        "thinking_level": model_params.thinking_level,
    }


def get_bedrock_model_params(
    model_params: AWSBedrockChatModelParams,
) -> dict[str, Any]:
    return {
        "temperature": model_params.temperature,
        "max_tokens": model_params.max_tokens,
        "timeout": model_params.timeout,
        "max_retries": model_params.max_retries,
    }
