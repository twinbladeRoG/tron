from functools import lru_cache
from typing import Literal, Optional

from fastembed import LateInteractionTextEmbedding, SparseTextEmbedding, TextEmbedding
from openai import AzureOpenAI, OpenAI
from openai.types import CreateEmbeddingResponse
from pydantic import BaseModel

from src.core.config import settings


class EmbeddingModel(BaseModel):
    model_name: str
    embedding_size: int
    description: Optional[str] = None
    type: Literal[
        "text-embedding", "late-interaction-text-embedding", "sparse-text-embedding"
    ] = "text-embedding"


@lru_cache(maxsize=8)
def get_text_embedding_model(model_name: str):
    model = TextEmbedding(model_name=model_name)
    return model


@lru_cache(maxsize=8)
def get_late_interaction_text_embedding_model(model_name: str):
    model = LateInteractionTextEmbedding(model_name=model_name)
    return model


@lru_cache(maxsize=8)
def get_sparse_text_embedding_model(model_name: str):
    model = SparseTextEmbedding(model_name=model_name)
    return model


class EmbeddingService:
    EMBEDDING_PROVIDERS = {
        "openai": [
            EmbeddingModel(model_name="text-embedding-3-large", embedding_size=3072)
        ],
        "azure-openai": [
            EmbeddingModel(model_name="text-embedding-3-large", embedding_size=3072)
        ],
        "llama-cpp": [
            EmbeddingModel(
                model_name=settings.EMBEDDING_MODEL_NAME, embedding_size=1024
            )
        ],
        "fastembed": [
            EmbeddingModel(
                model_name="BAAI/bge-small-en",
                embedding_size=get_text_embedding_model(
                    "BAAI/bge-small-en"
                ).embedding_size,
                description=get_text_embedding_model("BAAI/bge-small-en")
                ._get_model_description("BAAI/bge-small-en")
                .description,
            ),
            EmbeddingModel(
                model_name="colbert-ir/colbertv2.0",
                embedding_size=get_late_interaction_text_embedding_model(
                    "colbert-ir/colbertv2.0"
                ).embedding_size,
                description=get_late_interaction_text_embedding_model(
                    "colbert-ir/colbertv2.0"
                )
                ._get_model_description("colbert-ir/colbertv2.0")
                .description,
                type="late-interaction-text-embedding",
            ),
            EmbeddingModel(
                model_name="prithivida/Splade_PP_en_v1",
                embedding_size=0,
                description=get_sparse_text_embedding_model(
                    "prithivida/Splade_PP_en_v1"
                )
                ._get_model_description("prithivida/Splade_PP_en_v1")
                .description,
                type="sparse-text-embedding",
            ),
        ],
    }

    def __init__(self) -> None:
        self.openai = OpenAI(api_key=settings.OPEN_API_KEY.get_secret_value())
        self.azure_openai = AzureOpenAI(
            api_key=settings.AZURE_OPEN_AI_KEY.get_secret_value(),
            azure_endpoint=settings.AZURE_OPEN_AI_ENDPOINT,
            api_version=settings.AZURE_OPEN_AI_VERSION,
        )
        self.llama_cpp = OpenAI(
            base_url=f"{settings.EMBEDDING_MODEL_HOST}/v1",
            api_key=str(settings.EMBEDDING_MODEL_SECRET),
        )

    def get_embedding_size(
        self,
        provider: str = "llama-cpp",
        model_name: str = settings.EMBEDDING_MODEL_NAME,
    ) -> int:
        if provider not in self.EMBEDDING_PROVIDERS:
            raise ValueError(
                f"Unsupported embedding provider '{provider}'. "
                f"Available providers: {list(self.EMBEDDING_PROVIDERS.keys())}"
            )

        models = self.EMBEDDING_PROVIDERS[provider]

        for model in models:
            if model.model_name == model_name:
                return model.embedding_size

        raise ValueError(
            f"Model '{model_name}' not found for provider '{provider}'. "
            f"Available models: {[m.model_name for m in models]}"
        )

    def _validate_model_name(self, provider: str, model_name: str) -> None:
        if provider not in self.EMBEDDING_PROVIDERS:
            raise ValueError(
                f"Unsupported embedding provider '{provider}'. "
                f"Available: {list(self.EMBEDDING_PROVIDERS.keys())}"
            )

        allowed_models = [
            model.model_name for model in self.EMBEDDING_PROVIDERS[provider]
        ]

        if model_name not in allowed_models:
            raise ValueError(
                f"Model '{model_name}' is not supported for provider '{provider}'. "
                f"Allowed models: {allowed_models}"
            )

    def create_embedding(
        self,
        input: str | list[str],
        provider: str = "llama-cpp",
        model_name: str = settings.EMBEDDING_MODEL_NAME,
    ) -> CreateEmbeddingResponse:
        self._validate_model_name(provider, model_name)

        match provider:
            case "azure-openai":
                return self.azure_openai.embeddings.create(
                    input=input,
                    model=model_name,
                    encoding_format="float",
                )

            case "openai":
                return self.openai.embeddings.create(
                    input=input,
                    model=model_name,
                    encoding_format="float",
                )

            case "llama-cpp":
                return self.llama_cpp.embeddings.create(
                    input=input,
                    model=model_name,
                    encoding_format="float",
                )

            case _:
                raise ValueError(f"Unsupported embedding provider '{provider}'")
