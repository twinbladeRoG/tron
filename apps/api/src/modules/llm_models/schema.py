from enum import Enum

from sqlmodel import Column, Field, SQLModel, String


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
