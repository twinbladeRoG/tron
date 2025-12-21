from pydantic import HttpUrl
from sqlmodel import SQLModel


class ScrapePayload(SQLModel):
    url: HttpUrl
