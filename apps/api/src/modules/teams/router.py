from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query

from src.core.dependencies import (
    CurrentUser,
    DivisionControllerDeps,
    TeamControllerDeps,
)
from src.models.models import Team
from src.models.pagination import TeamExtendedPaginated

from .schema import CreateTeam, PaginatedFilterParams

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.get("/", response_model=TeamExtendedPaginated)
def get_teams(
    controller: TeamControllerDeps,
    query: Annotated[PaginatedFilterParams, Query()],
):
    teams, pagination = controller.get_all_teams(query)
    return TeamExtendedPaginated(data=teams, pagination=pagination)


@router.post("/", response_model=Team)
def add_team(
    user: CurrentUser,
    body: CreateTeam,
    controller: TeamControllerDeps,
    division_controller: DivisionControllerDeps,
):
    division_controller.get_division_by_id(body.division_id)
    return controller.add_team(body)


@router.patch("/{team_id}", response_model=Team)
def update_team(
    user: CurrentUser,
    body: CreateTeam,
    controller: TeamControllerDeps,
    team_id: UUID,
):
    return controller.update_team(team_id, body)


@router.delete("/{team_id}", response_model=Team)
def remove_team(
    user: CurrentUser,
    controller: TeamControllerDeps,
    team_id: UUID,
):
    return controller.remove_team(team_id)
