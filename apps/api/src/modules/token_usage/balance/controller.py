from uuid import UUID

from src.core.controller.base import BaseController
from src.models.models import TokenBalance, User

from ..utils import get_period_key
from .repository import TokenBalanceRepository


class TokenBalanceController(BaseController[TokenBalance]):
    def __init__(self, repository: TokenBalanceRepository) -> None:
        super().__init__(model=TokenBalance, repository=repository)
        self.repository = repository

    def get_balance_by_model(self, user: User, model_id: UUID):
        balances: list[TokenBalance] = []
        period_key = get_period_key()

        user_balance = self.repository.get_balance(
            model_id=model_id,
            subject_type="user",
            subject_id=user.id,
            period_key=period_key,
        )
        if user_balance:
            balances.append(user_balance)

        if user.teams and len(user.teams) > 0:
            for team in user.teams:
                team_balance = self.repository.get_balance(
                    model_id=team.id,
                    subject_type="team",
                    subject_id=user.id,
                    period_key=period_key,
                )
                if team_balance:
                    balances.append(team_balance)

        if user.division_id:
            division_balance = self.repository.get_balance(
                model_id=user.division_id,
                subject_type="division",
                subject_id=user.id,
                period_key=period_key,
            )
            if division_balance:
                balances.append(division_balance)

        if user.organization_id:
            organization_balance = self.repository.get_balance(
                model_id=user.organization_id,
                subject_type="division",
                subject_id=user.id,
                period_key=period_key,
            )
            if organization_balance:
                balances.append(organization_balance)

        return balances
