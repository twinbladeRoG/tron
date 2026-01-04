from fastapi import APIRouter, WebSocket

from src.core.dependencies import (
    CurrentUser,
    LlmModelControllerDeps,
    ScrapeControllerDeps,
)
from src.core.logger import logger

from .schema import ScrapePayload, ScrapeResult

router = APIRouter(prefix="/scrapper", tags=["Scrapper"])


@router.post("/", response_model=ScrapeResult)
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
    return ScrapeResult(
        url=body.url.encoded_string(), result=markdown, attributes=metadata
    )


@router.post("/discover", response_model=list[str])
async def discover_urls(
    user: CurrentUser,
    controller: ScrapeControllerDeps,
    body: ScrapePayload,
):
    return controller.discover_urls_from_sitemap(body.url.encoded_string())


@router.websocket("/extract-attributes")
async def extract_attributes(
    websocket: WebSocket,
    controller: ScrapeControllerDeps,
    *,
    llm_model_controller: LlmModelControllerDeps,
):
    logger.debug("WS: Starting")
    await websocket.accept()
    logger.debug("WS: Started")

    while True:
        data = await websocket.receive_json()
        urls = data.get("urls", [])

        for url in urls:
            markdown = await controller.scrape(url)
            metadata = controller.generate_tags(
                markdown, llm_model_controller=llm_model_controller
            )
            result = ScrapeResult(url=url, result=markdown, attributes=metadata)
            await websocket.send_json(result.model_dump())

        await websocket.close(1000, "All URLs processed")
