from uuid import UUID

from src.core.repository.base import BaseRepository
from src.models.models import TokenBalance


class TokenBalanceRepository(BaseRepository[TokenBalance]):
    def get_balance(
        self,
        subject_type: str,
        subject_id: UUID,
        model_id: UUID,
        period_key: str,
    ):
        return self.session.get(
            TokenBalance,
            (subject_type, subject_id, period_key, model_id),
        )
