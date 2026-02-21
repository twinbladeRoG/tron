from fastapi import APIRouter

from src.core.dependencies import CurrentUser, PolicyControllerDeps

from .schema import Policy

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
