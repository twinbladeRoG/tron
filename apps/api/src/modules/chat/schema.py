from sqlmodel import SQLModel


class ChatPayload(SQLModel):
    message: str
    model: str
