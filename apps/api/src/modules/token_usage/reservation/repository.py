from uuid import UUID

from sqlmodel import func, select

from src.core.repository.base import BaseRepository
from src.models.models import TokenReservation
from src.utils.time import utcnow

class TokenReservationRepository(BaseRepository[TokenReservation]):
    def get_active_reserved_tokens(
        self,
        *,
        bucket_id: UUID,
        period_key: str,
        exclude_request_id: UUID | None = None,
    ) -> int:
        statement = select(
            func.coalesce(func.sum(TokenReservation.reserved_tokens), 0)
        ).where(
            TokenReservation.bucket_id == bucket_id,
            TokenReservation.period_key == period_key,
            TokenReservation.expires_at > utcnow(),
        )

        if exclude_request_id is not None:
            statement = statement.where(
                TokenReservation.request_id != exclude_request_id
            )

        return self.session.exec(statement).one()

    def delete_reservations(self, reservations: list[TokenReservation]) -> None:
        for reservation in reservations:
            self.session.delete(reservation)
