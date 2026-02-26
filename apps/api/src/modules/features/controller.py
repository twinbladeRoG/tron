from uuid import UUID

from src.core.controller.base import BaseController
from src.models.models import Feature

from .repository import FeatureRepository


class FeatureController(BaseController[Feature]):
    def __init__(self, repository: FeatureRepository) -> None:
        super().__init__(model=Feature, repository=repository)
        self.repository = repository

    def get_features(self):
        return self.repository.get_feature()

    def remove_feature(self, feature_id: UUID):
        feature = self.get_by_id(feature_id)
        self.repository.delete(feature)
        return feature
