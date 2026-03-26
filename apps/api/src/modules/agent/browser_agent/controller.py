from .agent import BrowserAgent


class BrowserAgentController:
    def __init__(self) -> None:
        self._browser_agent = BrowserAgent()

    def chat(self, task: str):
        agent = self._browser_agent.get_agent(task=task)

        history = agent.run_sync(max_steps=10)

        visited_urls = history.urls()
        result = history.final_result()
        thoughts = history.model_thoughts()
        actions = history.action_results()
        duration = history.total_duration_seconds()

        return {
            "visited_urls": visited_urls,
            "result": result,
            "thoughts": thoughts,
            "actions": actions,
            "duration": duration,
        }
