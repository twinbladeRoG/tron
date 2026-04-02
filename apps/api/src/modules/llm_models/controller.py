from uuid import UUID

from src.core.controller.base import BaseController
from src.core.exception import BadRequestException, NotFoundException
from src.models.models import LlmCredential, LlmModel
from src.modules.llm_credentials.repository import LlmCredentialRepository
from src.modules.llm_credentials.service import LlmCredentialService

from .llms.aws_bedrock import AWSBedrockModelProvider
from .llms.azure_openai import AzureOpenAIModelProvider
from .llms.google_gemini import GoogleGeminiModelProvider
from .llms.llama_cpp import LlamaCppProvider
from .llms.openai import OpenAIModelProvider
from .repository import LlmModelRepository
from .schema import LlmModelBase, LlmProvider


class LlmModelController(BaseController[LlmModel]):
    def __init__(
        self,
        repository: LlmModelRepository,
        credential_repository: LlmCredentialRepository,
    ) -> None:
        super().__init__(model=LlmModel, repository=repository)
        self.repository = repository
        self.credential_repository = credential_repository
        self.credential_service = LlmCredentialService()

    def add_llm_model(self, data: LlmModelBase):
        self._validate_credential(data.provider.value, data.credential_id)
        return self.repository.create(data.model_dump())

    def update_llm_model(self):
        pass

    def remove_llm_model(self, id: UUID):
        model = self.repository.get_by("id", id.hex, unique=True)
        self.repository.delete(model)
        return model

    def get_llm_models(self):
        return self.repository.get_all()

    def get_llm_model_by_slug(self, slug: str):
        return self.repository.get_by_slug(slug)

    def _validate_credential(self, provider: str, credential_id: UUID | None) -> None:
        if credential_id is None:
            return

        credential = self.credential_repository.get_by("id", credential_id, unique=True)
        if credential.provider != provider:
            raise BadRequestException(
                "Selected credential provider must match the LLM model provider."
            )

    def get_chat_model(self, model: LlmModel):
        credential = self._get_runtime_credential(model)
        resolved_credential = self.credential_service.resolve(model.provider, credential)

        match model.provider:
            case LlmProvider.OPEN_AI.value:
                openai = OpenAIModelProvider()
                return openai.get_model(model.name, resolved_credential)
            case LlmProvider.LLAMA_CPP.value:
                llama_cpp = LlamaCppProvider()
                return llama_cpp.get_model(model.name)
            case LlmProvider.AZURE.value:
                azure = AzureOpenAIModelProvider()
                return azure.get_model(model.name, resolved_credential)
            case LlmProvider.GOOGLE.value:
                google = GoogleGeminiModelProvider()
                return google.get_model(model.name, resolved_credential)
            case LlmProvider.AWS.value:
                aws = AWSBedrockModelProvider()
                return aws.get_model(model.name, resolved_credential)
            case _:
                raise NotFoundException(
                    f"No model found named: {model.name} for provider {model.provider}"
                )

    def get_model(self, identifier: str | UUID):
        return self.repository.get_model(identifier)

    def _get_runtime_credential(self, model: LlmModel) -> LlmCredential | None:
        if model.credential_id is None:
            return None

        credential = self.credential_repository.get_by(
            "id", model.credential_id, unique=True
        )
        if credential.provider != model.provider:
            raise BadRequestException(
                "Selected credential provider must match the LLM model provider."
            )
        return credential
