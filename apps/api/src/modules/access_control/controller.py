from casbin.enforcer import Enforcer

from .schema import Policy


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
