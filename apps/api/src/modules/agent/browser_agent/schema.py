from pydantic import BaseModel


class ChatPayload(BaseModel):
    task: str
