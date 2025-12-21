from crawl4ai import AsyncWebCrawler
from langchain.messages import HumanMessage, SystemMessage
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
