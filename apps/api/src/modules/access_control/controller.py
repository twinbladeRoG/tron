from casbin.enforcer import Enforcer


class PolicyController:
    def __init__(self, enforcer: Enforcer) -> None:
        self.enforcer = enforcer

    def add_policy(self, policy: list[str]):
        return self.enforcer.add_policy(*policy)

    def remove_policy(self, policy: list[str]):
        return self.enforcer.remove_policy(*policy)

    def get_policy(self):
        return self.enforcer.get_policy()
