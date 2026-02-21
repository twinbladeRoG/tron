from pydantic import BaseModel


class Policy(BaseModel):
    sub: str
    obj: str
    act: str
    cond: str
    eft: str = "allow"
    desc: str | None = None
