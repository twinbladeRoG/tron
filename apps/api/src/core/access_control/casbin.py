from casbin.enforcer import Enforcer
from casbin.util import key_match2
from casbin_sqlalchemy_adapter import Adapter

from ..db import engine

adapter = Adapter(engine)
enforcer = Enforcer("src/core/access_control/model.conf", adapter)
enforcer.load_policy()
enforcer.enable_auto_save(True)
enforcer.add_function("keyMatch2", key_match2)


def get_casbin_enforcer() -> Enforcer:
    return enforcer
