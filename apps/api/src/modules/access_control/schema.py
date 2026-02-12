from pydantic import BaseModel


class PolicyDefinition(BaseModel):
    params: list[str]
