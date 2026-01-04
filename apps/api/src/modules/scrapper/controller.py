from typing import Set
from urllib.parse import urljoin

import requests
from crawl4ai import AsyncWebCrawler
from langchain.messages import HumanMessage, SystemMessage
from lxml import etree  # type: ignore
from pydantic import BaseModel, Field
from sqlmodel import Session

from src.modules.llm_models.controller import LlmModelController


class PageMetadata(BaseModel):
    page_type: str = Field(
        description="Type of the webpage, example: Homepage, Content Hub, Blog Post or News Article"
    )
    page_content: str = Field(
        description="Type of the content. Can be like Astrology, Daily Horoscope or LifeStyle. Should be only one value."
    )
    customer_persona: str = Field(
        description="Type of customer persona. Can be like  Entertainment Seeker, Astrology Enthusiast or Music Lover. Should be only one value."
    )


class ScrapeController:
    def __init__(self, session: Session) -> None:
        self.session = session

    async def scrape(self, url: str):
        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(url=url)
            return result.markdown  # type: ignore

    def generate_tags(self, content: str, *, llm_model_controller: LlmModelController):
        model = llm_model_controller.get_llm_model_by_name("gpt-5")
        chat_model = llm_model_controller.get_chat_model(model)

        system_message = SystemMessage(
            content="""You are AI Assistant which will analyse the page content scrapped from a webpage and generate the following relevant information.
            
            page_type: Type of page like Home Page, Blog, News Article, etc.
            page_content: Type of content like Astrology, Daily Horoscope, LifeStyle, etc.
            customer_persona: Type of customer persona, example: Entertainment Seeker, Astrology Enthusiast, Music Lover, etc.
            """
        )

        human_message = HumanMessage(
            content=f"""
            <PageContent>
            {content}
            </PageContent>
            """
        )

        response = chat_model.with_structured_output(PageMetadata).invoke(
            input=[system_message, human_message]
        )

        return response

    def discover_urls_from_sitemap(
        self,
        base_url: str,
        sitemap_url: str | None = None,
        timeout: int = 10,
    ) -> list[str]:
        """
        Discover all URLs from sitemap.xml (supports sitemap index).
        """
        HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; SitemapCrawler/1.0)"}

        if sitemap_url is None:
            sitemap_url = urljoin(base_url, "/sitemap.xml")

        discovered_urls: Set[str] = set()
        visited_sitemaps: Set[str] = set()

        def fetch_sitemap(url: str):
            if url in visited_sitemaps:
                return
            visited_sitemaps.add(url)

            resp = requests.get(url, headers=HEADERS, timeout=timeout)
            resp.raise_for_status()

            xml = etree.fromstring(resp.content)

            ns = {"ns": xml.nsmap.get(None)} if None in xml.nsmap else {}

            # Case 1: Sitemap index
            sitemap_tags = xml.findall(".//ns:sitemap/ns:loc", namespaces=ns)
            if sitemap_tags:
                for loc in sitemap_tags:
                    fetch_sitemap(loc.text.strip())
                return

            # Case 2: URL set
            url_tags = xml.findall(".//ns:url/ns:loc", namespaces=ns)
            for loc in url_tags:
                discovered_urls.add(loc.text.strip())

        fetch_sitemap(sitemap_url)

        return sorted(discovered_urls)
