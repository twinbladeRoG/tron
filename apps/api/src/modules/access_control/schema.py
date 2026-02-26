from typing import Optional

from pydantic import BaseModel

from src.modules.features.schema import FeatureBase


class Policy(BaseModel):
    sub: str
    obj: str
    act: str
    cond: str
    eft: str = "allow"
    desc: str | None = None


class PolicyEnforceResult(BaseModel):
    is_allowed: bool
    policy_enforced: str


class FeatureAccess(FeatureBase):
    is_allowed: bool
    policy_enforced: Optional[str] = None
