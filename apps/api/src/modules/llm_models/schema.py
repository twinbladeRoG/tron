from enum import Enum

from sqlmodel import Column, Field, Integer, SQLModel, String, text


class LlmProvider(str, Enum):
    OPEN_AI = "openai"
    AZURE = "azure"
    GOOGLE = "google"
    AWS = "aws"
    LLAMA_CPP = "llama-cpp"


class LlmModelBase(SQLModel):
    name: str = Field(unique=True)
    display_name: str = Field(unique=True)
    provider: LlmProvider = Field(sa_column=Column(String))
    context_window: int = Field(
        sa_column=Column(Integer, server_default=text("128000")), default=128000
    )
    max_output_tokens: int = Field(
        sa_column=Column(Integer, server_default=text("4096")), default=4096
    )
