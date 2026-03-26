from typing import Optional

from browser_use import Agent, Browser, ChatOpenAI

from src.core.config import settings


class BrowserAgent:
    def __init__(self) -> None:
        pass

    def _get_browser(self, *, from_system: Optional[bool] = False):
        if from_system:
            return Browser.from_system_chrome()

        return Browser(
            headless=False,
            window_size={"width": 1600, "height": 900},
        )

    def _get_local_browser_profiles(self):
        profiles = Browser.list_chrome_profiles()
        return profiles

    def _get_llm(self):
        # https://github.com/browser-use/browser-use/blob/main/examples/models/langchain/chat.py
        llm = ChatOpenAI(
            api_key=settings.OPEN_API_KEY.get_secret_value(),
            model="gpt-5-mini",
        )
        return llm

    def get_agent(
        self,
        task: str,
    ):
        agent = Agent(
            task=task,
            calculate_cost=True,
            generate_gif=True,
            llm=self._get_llm(),
            browser=self._get_browser(),
        )
        return agent
