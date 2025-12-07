from uuid import UUID

from src.core.controller.base import BaseController
from src.models.models import LlmModel

from .llms.openai import OpenAIModelProvider, OpenAIModels
from .repository import LlmModelRepository
from .schema import LlmModelBase


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

    def chat(self, message: str):
        openai = OpenAIModelProvider()
        llm = openai.get_model(OpenAIModels.GPT_4o_mini)
        messages = [
            (
                "system",
                "You are a helpful assistant that translates English to French. Translate the user sentence.",
            ),
            ("human", message),
        ]
        response = llm.invoke(input=messages)
        return response
