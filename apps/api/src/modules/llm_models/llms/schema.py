from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ChatModelParamsBase(BaseModel):
    model_config = ConfigDict(extra="forbid")


class OpenAICompliantChatModelParams(ChatModelParamsBase):
    temperature: float = 0
    timeout: float | None = None
    max_retries: int = 2
    stream_usage: bool = True
    max_tokens: int | None = None
    thinking_level: Literal["minimal", "low", "medium", "high"] | None = Field(
        default=None
    )


class OpenAIChatModelParams(OpenAICompliantChatModelParams):
    pass


class AzureOpenAIChatModelParams(OpenAICompliantChatModelParams):
    pass


class LlamaCppChatModelParams(OpenAICompliantChatModelParams):
    pass


class GoogleGeminiChatModelParams(ChatModelParamsBase):
    temperature: float = 1.0
    timeout: float | None = None
    max_retries: int = 2
    max_tokens: int | None = None
    thinking_level: Literal["minimal", "low", "medium", "high"] | None = Field(
        default=None
    )


class AWSBedrockChatModelParams(ChatModelParamsBase):
    temperature: float = 0
    timeout: float | None = None
    max_retries: int = 2
    max_tokens: int | None = None


type ChatModelParams = (
    OpenAIChatModelParams
    | AzureOpenAIChatModelParams
    | LlamaCppChatModelParams
    | GoogleGeminiChatModelParams
    | AWSBedrockChatModelParams
)
