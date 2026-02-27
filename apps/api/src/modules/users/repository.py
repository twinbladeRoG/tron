from src.core.repository.base import BaseRepository
from src.models.models import Team, User


class UserRepository(BaseRepository[User]):
    def get_by_email(self, email: str) -> User | None:
        response = self.get_by(field="email", value=email, unique=True)
        return response

    def update_user_teams(self, user: User, teams: list[Team]):
        user.teams = teams
        self.session.add(user)
        self.session.commit()
        return user
