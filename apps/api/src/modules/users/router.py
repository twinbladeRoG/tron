from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query

from src.core.dependencies import (
    CurrentUser,
    DivisionControllerDeps,
    OrganizationControllerDeps,
    PolicyControllerDeps,
    UserControllerDeps,
)
from src.core.exception import BadRequestException
from src.models.pagination import UserPublicExtendedPaginated

from .schema import (
    PaginatedFilterParams,
    UserAttachDivisionRequest,
    UserAttachOrganizationRequest,
    UserCreate,
    UserPublic,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=UserPublicExtendedPaginated)
def get_all_users(
    user_controller: UserControllerDeps,
    user: CurrentUser,
    query: Annotated[PaginatedFilterParams, Query()],
):
    users, pagination = user_controller.get_users(query)
    return UserPublicExtendedPaginated(data=users, pagination=pagination)


@router.get("/{id}", response_model=UserPublic)
def get_user_by_id(id: UUID, user_controller: UserControllerDeps, user: CurrentUser):
    user = user_controller.get_by_id(id)
    return user


@router.post("/", response_model=UserPublic)
def create_user(user_controller: UserControllerDeps, user: UserCreate):
    username_exists = user_controller.repository.get_by("username", user.username)
    if username_exists:
        raise BadRequestException(f"Username {user.username} already exists")
    response = user_controller.create(user)
    return response


@router.patch("/{id}/organization", response_model=UserPublic)
def attach_organization(
    auth_user: CurrentUser,
    id: UUID,
    controller: UserControllerDeps,
    policy_controller: PolicyControllerDeps,
    organization_controller: OrganizationControllerDeps,
    body: UserAttachOrganizationRequest,
):
    organization = organization_controller.get_organization_by_id(body.organization_id)
    user = controller.attach_organization(id, organization.id)
    policy_controller.group_user_with_organization(user)
    return user


@router.patch("/{id}/division", response_model=UserPublic)
def attach_division(
    auth_user: CurrentUser,
    id: UUID,
    controller: UserControllerDeps,
    policy_controller: PolicyControllerDeps,
    division_controller: DivisionControllerDeps,
    body: UserAttachDivisionRequest,
):
    user = controller.get_by_id(id)

    if user.organization_id is None:
        raise BadRequestException("User is not part of any organization yet.")

    division = division_controller.get_by_id(body.division_id)

    if user.organization_id != division.organization_id:
        raise BadRequestException(
            f"Division {division.name} is part of Organization {division.organization.name}, but user is not part of this organization"
        )

    user = controller.attach_division(id, division.id)
    policy_controller.group_user_with_division(user)
    return user
