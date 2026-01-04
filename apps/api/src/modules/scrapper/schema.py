from typing import Any

from pydantic import HttpUrl
from sqlmodel import SQLModel


class ScrapePayload(SQLModel):
    url: HttpUrl


class ScrapeResult(SQLModel):
    url: str
    result: str
    attributes: Any
