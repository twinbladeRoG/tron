from fastapi import APIRouter

from src.core.dependencies import (
    CurrentUser,
    LlmModelControllerDeps,
    ScrapeControllerDeps,
)

from .schema import ScrapePayload

router = APIRouter(prefix="/scrapper", tags=["Scrapper"])


@router.post("/")
async def scrape(
    user: CurrentUser,
    controller: ScrapeControllerDeps,
    body: ScrapePayload,
    *,
    llm_model_controller: LlmModelControllerDeps,
):
    markdown = await controller.scrape(body.url.encoded_string())
    metadata = controller.generate_tags(
        markdown, llm_model_controller=llm_model_controller
    )
    return {"result": markdown, "metadata": metadata}
