from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query

from src.core.dependencies import (
    CurrentUser,
    DivisionControllerDeps,
    LlmModelControllerDeps,
    OrganizationControllerDeps,
    TeamControllerDeps,
    TokenBucketControllerDeps,
    TokeUsageServiceDeps,
    UserControllerDeps,
)
from src.core.exception import BadRequestException
from src.models.models import TokenBucket
from src.models.pagination import TokenBucketPaginated

from ..schema import TokenUsage
from .schema import CreateUserTokenBucket, ModelBucketQueryParams, TokenBucketBase

router = APIRouter(prefix="/token-buckets", tags=["Token Buckets"])


@router.get(
    "/model/{model_id}",
    response_model=list[TokenBucket],
    name="Get buckets of a model for the authenticated user",
)
def get_user_buckets(
    user: CurrentUser,
    controller: TokenBucketControllerDeps,
    model_id: UUID,
    llm_model_controller: LlmModelControllerDeps,
):
    llm_model_controller.get_by_id(id=model_id)
    return controller.get_user_buckets(user, model_id)


@router.get(
    "/models/{model_id}",
    response_model=TokenBucketPaginated,
    name="Get all buckets of a model",
)
def get_model_buckets(
    user: CurrentUser,
    controller: TokenBucketControllerDeps,
    model_id: UUID,
    llm_model_controller: LlmModelControllerDeps,
    query: Annotated[ModelBucketQueryParams, Query()],
):
    llm_model_controller.get_by_id(id=model_id)
    buckets, pagination = controller.get_all_model_buckets(model_id, query)
    return TokenBucketPaginated(data=buckets, pagination=pagination)


@router.post(
    "/user/{user_id}", response_model=TokenBucket, name="Create a bucket for a user"
)
def create_user_bucket(
    auth_user: CurrentUser,
    user_id: UUID,
    controller: TokenBucketControllerDeps,
    body: CreateUserTokenBucket,
    llm_model_controller: LlmModelControllerDeps,
    user_controller: UserControllerDeps,
):
    user = user_controller.get_by_id(user_id)
    llm_model_controller.get_by_id(id=body.model_id)
    return controller.create_user_bucket(user, body)


@router.get(
    "/user/{user_id}/model/{model_id}",
    response_model=list[TokenBucket],
    name="Get buckets of user for a model",
)
def get_buckets_for_user(
    auth_user: CurrentUser,
    user_id: UUID,
    model_id: UUID,
    controller: TokenBucketControllerDeps,
    llm_model_controller: LlmModelControllerDeps,
    user_controller: UserControllerDeps,
):
    user = user_controller.get_by_id(user_id)
    llm_model_controller.get_by_id(id=model_id)
    return controller.get_user_buckets(user, model_id)


@router.get(
    "/usage/{model_identifier}",
    response_model=TokenUsage,
    name="Get token usage statistics of the authenticated user",
)
def get_user_token_usage(
    user: CurrentUser,
    model_identifier: str,
    service: TokeUsageServiceDeps,
):
    return service.get_user_token_usage_per_model(user.id, model_identifier)


@router.post("/", response_model=TokenBucket)
def create_bucket(
    user: CurrentUser,
    body: TokenBucketBase,
    controller: TokenBucketControllerDeps,
    user_controller: UserControllerDeps,
    organization_controller: OrganizationControllerDeps,
    team_controller: TeamControllerDeps,
    division_controller: DivisionControllerDeps,
):
    if body.subject_type == "user":
        user_controller.get_by_id(body.subject_id)
    elif body.subject_type == "team":
        team_controller.get_by_id(body.subject_id)
    elif body.subject_type == "division":
        division_controller.get_by_id(body.subject_id)
    elif body.subject_type == "organization":
        organization_controller.get_by_id(body.subject_id)
    else:
        raise BadRequestException(f"{body.subject_type} is an invalid subject type")
    return controller.create_bucket(body)
