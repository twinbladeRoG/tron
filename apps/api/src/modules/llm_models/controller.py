from uuid import UUID

from src.core.controller.base import BaseController
from src.core.exception import NotFoundException
from src.models.models import LlmModel

from .llms.llama_cpp import LlamaCppProvider
from .llms.openai import OpenAIModelProvider
from .repository import LlmModelRepository
from .schema import LlmModelBase, LlmProvider


class LlmModelController(BaseController[LlmModel]):
    def __init__(self, repository: LlmModelRepository) -> None:
        super().__init__(model=LlmModel, repository=repository)
        self.repository = repository

    def add_llm_model(self, data: LlmModelBase):
        return self.repository.create(data.model_dump())

    def update_llm_model(self):
        pass

    def remove_llm_model(self, id: UUID):
        model = self.repository.get_by("id", id.hex, unique=True)
        self.repository.delete(model)
        return model

    def get_llm_models(self):
        return self.repository.get_all()

    def get_llm_model_by_name(self, model_name: str):
        return self.repository.get_by("name", model_name, unique=True)

    def get_chat_model(self, model: LlmModel):
        match model.provider:
            case LlmProvider.OPEN_AI.value:
                openai = OpenAIModelProvider()
                return openai.get_model(model.name)
            case LlmProvider.LLAMA_CPP.value:
                llama_cpp = LlamaCppProvider()
                return llama_cpp.get_model(model.name)
            case _:
                raise NotFoundException(f"No model found named: {model.name}")
