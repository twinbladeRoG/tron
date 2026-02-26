from sqlmodel import select

from src.core.repository.base import BaseRepository
from src.models.models import Feature


class FeatureRepository(BaseRepository[Feature]):
    def get_feature(self):
        statement = select(self.model_class)
        results = self.session.exec(statement).all()
        return list(results)
