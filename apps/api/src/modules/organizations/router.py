from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query

from src.core.dependencies import CurrentUser, OrganizationControllerDeps
from src.models.models import Organization
from src.models.pagination import OrganizationPaginated

from .schema import OrganizationBase, PaginatedFilterParams

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.get("/", response_model=OrganizationPaginated)
def get_organizations(
    controller: OrganizationControllerDeps,
    query: Annotated[PaginatedFilterParams, Query()],
):
    organizations, pagination = controller.get_all_organizations(query)
    return OrganizationPaginated(data=organizations, pagination=pagination)


@router.post("/", response_model=Organization)
def add_organization(
    user: CurrentUser, body: OrganizationBase, controller: OrganizationControllerDeps
):
    return controller.add_organization(body)


@router.patch("/{organization_id}", response_model=Organization)
def update_organization(
    user: CurrentUser,
    body: OrganizationBase,
    controller: OrganizationControllerDeps,
    organization_id: UUID,
):
    return controller.update_organization(organization_id, body)


@router.delete("/{organization_id}", response_model=Organization)
def remove_organization(
    user: CurrentUser,
    controller: OrganizationControllerDeps,
    organization_id: UUID,
):
    return controller.remove_organization(organization_id)
