from fastapi import APIRouter

from src.core.dependencies import (
    CurrentUser,
    FeatureControllerDeps,
    PolicyControllerDeps,
)
from src.core.exception import ForbiddenException

from .schema import FeatureAccess, Policy, PolicyEnforceResult

router = APIRouter(prefix="/access-control", tags=["Access Control"])


@router.post("/")
def add_policy(controller: PolicyControllerDeps, body: Policy, user: CurrentUser):
    return controller.add_policy(body)


@router.get("/", response_model=list[Policy])
def get_policy(controller: PolicyControllerDeps, user: CurrentUser):
    return controller.get_policy()


@router.delete("/")
def delete_policy(controller: PolicyControllerDeps, body: Policy, user: CurrentUser):
    return controller.remove_policy(body)


@router.get("/features/{feature_slug}", response_model=PolicyEnforceResult)
def check_feature_access(
    user: CurrentUser,
    feature_slug: str,
    controller: PolicyControllerDeps,
):
    return controller.check_if_user_has_access(
        f"feature:{feature_slug}", "access", user=user
    )


@router.get("/features", response_model=list[FeatureAccess])
def get_user_features(
    user: CurrentUser,
    feature_controller: FeatureControllerDeps,
    controller: PolicyControllerDeps,
):
    feature_list: list[FeatureAccess] = []

    for feature in feature_controller.get_features():
        try:
            result = controller.check_if_user_has_access(
                f"feature:{feature.slug}", "access", user=user
            )
            feature_list.append(
                FeatureAccess(
                    **feature.model_dump(),
                    is_allowed=result.is_allowed,
                    policy_enforced=result.policy_enforced,
                )
            )
        except ForbiddenException:
            feature_list.append(FeatureAccess(**feature.model_dump(), is_allowed=False))

    return feature_list
