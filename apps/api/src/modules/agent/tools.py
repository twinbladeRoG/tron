from datetime import datetime

from crawl4ai import AsyncWebCrawler
from langchain.tools import tool
from pydantic import HttpUrl


@tool
def get_current_time() -> str:
    """Get the current time"""
    return f"The current time is {datetime.now().isoformat()}."


@tool
async def get_webpage_content(url: HttpUrl) -> str:
    """Get text content of a given webpage"""
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url.encoded_string())
        return result.markdown  # type: ignore
