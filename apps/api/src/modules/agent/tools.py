from datetime import datetime

from crawl4ai import AsyncWebCrawler
from langchain.tools import tool
from langchain_community.tools import DuckDuckGoSearchResults
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


@tool
def search_web(query: str):
    "Web search tool using Duck Duck Go"
    search = DuckDuckGoSearchResults(output_format="json")
    result = search.invoke(query)
    # print("Result", result)
    return result
