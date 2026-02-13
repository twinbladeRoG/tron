from pydantic import BaseModel


class Policy(BaseModel):
    sub_rule: str
    obj_rule: str
    act: str
    eft: str = "allow"
    description: str | None = None
