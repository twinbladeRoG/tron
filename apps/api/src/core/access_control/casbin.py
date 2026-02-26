from casbin.enforcer import Enforcer
from casbin.util import key_match
from casbin_sqlalchemy_adapter import Adapter
from sqlalchemy import create_engine

from src.core.config import settings

engine = create_engine(settings.CASBIN_DATABASE_URI, echo=settings.SHOW_DB_LOGS)

adapter = Adapter(engine)
enforcer = Enforcer("src/core/access_control/model.conf", adapter)
enforcer.load_policy()
enforcer.enable_auto_save(True)
enforcer.add_function("keyMatch", key_match)


def get_casbin_enforcer() -> Enforcer:
    return enforcer
