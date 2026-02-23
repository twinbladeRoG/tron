from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query

from src.core.dependencies import (
    CurrentUser,
    DivisionControllerDeps,
    OrganizationControllerDeps,
)
from src.models.models import Division
from src.models.pagination import DivisionPaginated

from .schema import CreateDivision, PaginatedFilterParams

router = APIRouter(prefix="/divisions", tags=["Divisions"])


@router.get("/", response_model=DivisionPaginated)
def get_divisions(
    controller: DivisionControllerDeps,
    query: Annotated[PaginatedFilterParams, Query()],
):
    divisions, pagination = controller.get_all_divisions(query)
    return DivisionPaginated(data=divisions, pagination=pagination)


@router.post("/", response_model=Division)
def add_division(
    user: CurrentUser,
    body: CreateDivision,
    controller: DivisionControllerDeps,
    organization_controller: OrganizationControllerDeps,
):
    organization_controller.get_organization_by_id(body.organization_id)
    return controller.add_division(body)


@router.patch("/{division_id}", response_model=Division)
def update_division(
    user: CurrentUser,
    body: CreateDivision,
    controller: DivisionControllerDeps,
    division_id: UUID,
):
    return controller.update_division(division_id, body)


@router.delete("/{division_id}", response_model=Division)
def remove_division(
    user: CurrentUser,
    controller: DivisionControllerDeps,
    division_id: UUID,
):
    return controller.remove_division(division_id)
