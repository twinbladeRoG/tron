from casbin.enforcer import Enforcer

from .schema import Policy


class PolicyController:
    def __init__(self, enforcer: Enforcer) -> None:
        self.enforcer = enforcer

    @staticmethod
    def _policy_object_to_list(policy: Policy):
        params = [
            policy.sub_rule,
            policy.obj_rule,
            policy.act,
            policy.eft,
            policy.description,
        ]
        return params

    @staticmethod
    def _policy_list_to_object(policy: list[str]):
        return Policy(
            sub_rule=policy[0],
            obj_rule=policy[1],
            act=policy[2],
            eft=policy[3],
            description=policy[4] if len(policy) >= 5 else None,
        )

    def add_policy(self, policy: Policy):
        return self.enforcer.add_policy(*self._policy_object_to_list(policy))

    def remove_policy(self, policy: Policy):
        return self.enforcer.remove_policy(*self._policy_object_to_list(policy))

    def get_policy(self):
        policies: list[Policy] = []

        for policy in self.enforcer.get_policy():
            policies.append(self._policy_list_to_object(policy))

        return policies
