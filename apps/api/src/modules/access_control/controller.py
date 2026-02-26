from casbin.enforcer import Enforcer

from src.core.access_control.utils import build_user_context
from src.core.exception import BadRequestException, ForbiddenException
from src.models.models import User

from .schema import Policy, PolicyEnforceResult


class PolicyController:
    def __init__(self, enforcer: Enforcer) -> None:
        self.enforcer = enforcer

    @staticmethod
    def _policy_object_to_list(policy: Policy):
        params = [
            policy.sub,
            policy.obj,
            policy.act,
            policy.cond,
            policy.eft,
            policy.desc,
        ]
        return params

    @staticmethod
    def _policy_list_to_object(policy: list[str]):
        return Policy(
            sub=policy[0],
            obj=policy[1],
            act=policy[2],
            cond=policy[3],
            eft=policy[4],
            desc=policy[5],
        )

    def add_policy(self, policy: Policy):
        return self.enforcer.add_policy(*self._policy_object_to_list(policy))

    def remove_policy(self, policy: Policy):
        return self.enforcer.remove_policy(self._policy_object_to_list(policy))

    def get_policy(self):
        policies: list[Policy] = []

        for policy in self.enforcer.get_policy():
            policies.append(self._policy_list_to_object(policy))

        return policies

    def check_if_user_has_access(self, obj: str, action: str, *, user: User):
        context = build_user_context(user)

        is_allowed, policy = self.enforcer.enforce_ex(
            f"user:{user.username}", obj, action, context
        )

        if is_allowed:
            return PolicyEnforceResult(
                is_allowed=is_allowed, policy_enforced=policy[-1]
            )

        raise ForbiddenException(f"User does not have access")

    def group_user_with_organization(self, user: User):
        if user.organization is None:
            raise BadRequestException("User is not part of any organization")
        self.remove_user_from_all_organizations(user)
        self.enforcer.add_grouping_policy(
            f"user:{user.username}", f"organization:{user.organization.slug}"
        )

    def get_user_organizations(self, user: User) -> list[str]:
        roles = self.enforcer.get_roles_for_user(f"user:{user.username}")
        orgs = [r for r in roles if r.startswith("organization:")]
        return orgs

    def remove_user_from_all_organizations(self, user: User) -> None:
        organizations = self.get_user_organizations(user)

        for organization in organizations:
            self.enforcer.delete_role_for_user(f"user:{user.username}", organization)

    def group_user_with_division(self, user: User):
        if user.division is None:
            raise BadRequestException("User is not part of any division")
        self.remove_user_from_all_divisions(user)
        self.enforcer.add_grouping_policy(
            f"user:{user.username}", f"division:{user.division.slug}"
        )

    def get_user_divisions(self, user: User) -> list[str]:
        roles = self.enforcer.get_roles_for_user(f"user:{user.username}")
        divisions = [r for r in roles if r.startswith("division:")]
        return divisions

    def remove_user_from_all_divisions(self, user: User) -> None:
        divisions = self.get_user_divisions(user)

        for division in divisions:
            self.enforcer.delete_role_for_user(f"user:{user.username}", division)
