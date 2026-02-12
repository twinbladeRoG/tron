from fastapi import APIRouter

from src.core.dependencies import (
    PolicyControllerDeps,
)

from .schema import PolicyDefinition

router = APIRouter(prefix="/access-control", tags=["Access Control"])


@router.post("/")
async def add_policy(
    controller: PolicyControllerDeps,
    body: PolicyDefinition,
):
    return controller.add_policy(body.params)


@router.get("/", response_model=list[list[str]])
async def get_policy(controller: PolicyControllerDeps):
    return controller.get_policy()


@router.delete("/")
async def delete_policy(
    controller: PolicyControllerDeps,
    body: PolicyDefinition,
):
    return controller.remove_policy(body.params)
