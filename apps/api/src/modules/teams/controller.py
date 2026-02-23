from uuid import UUID

from sqlmodel import func, select

from src.core.controller.base import BaseController
from src.models.models import Team
from src.models.pagination import get_pagination

from .repository import TeamRepository
from .schema import CreateTeam, PaginatedFilterParams


class TeamController(BaseController[Team]):
    def __init__(self, repository: TeamRepository) -> None:
        super().__init__(model=Team, repository=repository)
        self.repository = repository

    def get_all_teams(self, query: PaginatedFilterParams):
        base_statement = self.repository._query()
        count_statement = select(func.count()).select_from(self.model_class)

        if query.division_id is not None:
            base_statement = base_statement.where(Team.division_id == query.division_id)
            count_statement = count_statement.where(
                Team.division_id == query.division_id
            )

        if query.search is not None:
            base_statement = base_statement.where(
                Team.name.ilike(f"%{query.search}%")  # type: ignore
            )
            count_statement = count_statement.where(
                Team.name.ilike(f"%{query.search}%")  # type: ignore
            )

        base_statement = base_statement.order_by(
            Team.created_at.desc(),  # type: ignore
            Team.id.desc(),  # type: ignore
        )
        statement = base_statement.offset(query.page * query.limit).limit(query.limit)
        teams = self.repository.session.exec(statement).all()

        count = self.repository.session.exec(count_statement).one()

        pagination = get_pagination(query.page, query.limit, count)

        return teams, pagination

    def get_team_by_id(self, id: UUID):
        return self.get_by_id(id)

    def add_team(self, data: CreateTeam):
        return self.create(data)

    def update_team(self, id: UUID, data: CreateTeam):
        return self.repository.update(id, data.model_dump())

    def remove_team(self, id: UUID):
        team = self.get_team_by_id(id)
        self.repository.delete(team)
        return team
