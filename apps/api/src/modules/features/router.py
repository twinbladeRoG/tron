from uuid import UUID

from fastapi import APIRouter

from src.core.dependencies import CurrentUser, FeatureControllerDeps
from src.models.models import Feature

from .schema import FeatureBase

router = APIRouter(prefix="/features", tags=["Features"])


@router.get("/", response_model=list[Feature])
def get_features(controller: FeatureControllerDeps, user: CurrentUser):
    return controller.get_features()


@router.get("/{feature_id}", response_model=Feature)
def get_feature(controller: FeatureControllerDeps, user: CurrentUser, feature_id: UUID):
    return controller.get_by_id(feature_id)


@router.post("/", response_model=Feature)
def add_feature(
    controller: FeatureControllerDeps, user: CurrentUser, body: FeatureBase
):
    return controller.create(body)


@router.delete("/{feature_id}", response_model=Feature)
def delete_feature(
    controller: FeatureControllerDeps, user: CurrentUser, feature_id: UUID
):
    return controller.remove_feature(feature_id)
