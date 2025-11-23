from functools import partial

from src.core.dependencies import SessionDep
from src.models.models import User
from src.modules.auth.controller import AuthController
from src.modules.users.controller import UserController
from src.modules.users.repository import UserRepository


class Factory:
    user_repository = partial(UserRepository, User)

    def get_user_controller(self, db_session: SessionDep):
        return UserController(repository=self.user_repository(session=db_session))

    def get_auth_controller(self, db_session: SessionDep):
        return AuthController(repository=self.user_repository(session=db_session))
