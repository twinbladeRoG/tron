import asyncio
import json

from browser_use import Agent
from browser_use.agent.views import PlanItem

from src.core.logger import logger
from src.modules.usage_log.schema import ModelUsageLogBase
from src.utils.time import utcnow

from .agent import BrowserAgent
from .schema import ChatPayload

_SENTINEL = object()  # signals the queue is done, used as a poison pill or stop token


class BrowserAgentController:
    def __init__(self) -> None:
        self._browser_agent = BrowserAgent()

    def _sse(self, event_type: str, data: dict | str) -> str:
        payload = data if isinstance(data, str) else json.dumps(data)
        return f"event: {event_type}\ndata: {payload}\n\n"

    async def _make_hooks(self, queue: asyncio.Queue):
        """Return hook closures that share *queue*."""

        async def on_step_start(agent: Agent):
            logger.debug("[BROWSER AGENT] Step Start")

            state = agent.state  # AgentState
            step = state.n_steps
            plan: list[PlanItem] = [] if state.plan is None else state.plan
            plans = [p.model_dump(mode="json") for p in plan]

            thought = (
                state.last_model_output.thinking if state.last_model_output else None
            )
            if step == 1 and thought == None:
                thought = "Planning steps..."

            await queue.put(self._sse("plan", {"plan": plans}))

            await queue.put(
                self._sse(
                    "step_start",
                    {
                        "step": step,
                        "thought": thought,
                    },
                )
            )

        async def on_step_end(agent: Agent):
            logger.debug("[BROWSER AGENT] Step End")
            state = agent.state
            step = state.n_steps

            # Latest action results and URLs visited so far
            actions = agent.history.action_results()
            last_action = (
                {
                    "is_done": actions[-1].is_done,
                    "success": actions[-1].success,
                    "extracted_content": actions[-1].extracted_content,
                    "error": actions[-1].error,
                }
                if actions
                else None
            )

            urls = list(dict.fromkeys(agent.history.urls()))

            plan: list[PlanItem] = [] if state.plan is None else state.plan
            plans = [p.model_dump(mode="json") for p in plan]

            await queue.put(self._sse("plan", {"plan": plans}))

            await queue.put(
                self._sse(
                    "step_end",
                    {
                        "step": step,
                        "last_action": last_action,
                        "urls": urls,
                    },
                )
            )

        return on_step_start, on_step_end

    async def chat(self, data: ChatPayload):
        queue: asyncio.Queue = asyncio.Queue()
        on_step_start, on_step_end = await self._make_hooks(queue)
        agent = self._browser_agent.get_agent(task=data.message)

        async def run_agent():
            try:
                start_time = utcnow()
                history = await agent.run(
                    max_steps=data.max_steps if data.max_steps != None else 7,
                    on_step_start=on_step_start,
                    on_step_end=on_step_end,
                )

                plan: list[PlanItem] = (
                    [] if agent.state.plan is None else agent.state.plan
                )
                plans = [p.model_dump(mode="json") for p in plan]

                await queue.put(self._sse("plan", {"plan": plans}))
                await queue.put(self._sse("result", {"result": history.final_result()}))

                if history.usage:
                    usage_log = ModelUsageLogBase(
                        prompt_tokens=history.usage.total_prompt_tokens,
                        prompt_tokens_cached=history.usage.total_prompt_cached_tokens,
                        reasoning_tokens=0,
                        completion_tokens=history.usage.total_completion_tokens,
                        total_tokens=history.usage.total_tokens,
                        total_cost=history.usage.total_cost,
                        time=history.total_duration_seconds(),
                        start_time=start_time,
                        end_time=utcnow(),
                        successful_requests=1,
                    )

                    await queue.put(
                        self._sse(
                            "usage",
                            {"usage": usage_log.model_dump(mode="json")},
                        )
                    )

                await queue.put(
                    self._sse(
                        "screenshots",
                        {
                            "screenshots": [
                                item
                                for item in history.screenshots()
                                if item is not None
                            ]
                        },
                    )
                )

            except Exception as e:
                await queue.put(self._sse("error", {"message": str(e)}))
            finally:
                await queue.put(_SENTINEL)  # always signal completion

        agent_task = asyncio.create_task(run_agent())

        while True:
            item = await queue.get()
            if item is _SENTINEL:
                break
            yield item

        await agent_task
