from datetime import timedelta
from uuid import UUID

from src.core.exception import NotFoundException
from src.models.models import (
    TokenBalance,
    TokenBucket,
    TokenLedger,
    TokenReservation,
)
from src.modules.llm_models.repository import LlmModelRepository
from src.utils.time import utcnow

from .balance.repository import TokenBalanceRepository
from .bucket.repository import TokenBucketRepository
from .ledger.repository import TokenLedgerRepository
from .reservation.repository import TokenReservationRepository
from .schema import TokenUsage, TokenUsagePerBucket
from .utils import get_period_key, get_token_subject


class QuotaExceededException(Exception):
    def __init__(self, message: str = "Quota exceeded"):
        super().__init__(message)


class TokeUsageService:
    def __init__(
        self,
        token_ledger_repository: TokenLedgerRepository,
        token_balance_repository: TokenBalanceRepository,
        token_bucket_repository: TokenBucketRepository,
        token_reservation_repository: TokenReservationRepository,
        llm_model_repository: LlmModelRepository,
    ) -> None:
        self.token_ledger_repository = token_ledger_repository
        self.token_balance_repository = token_balance_repository
        self.token_bucket_repository = token_bucket_repository
        self.token_reservation_repository = token_reservation_repository
        self.llm_model_repository = llm_model_repository

    def reserve_tokens(self, bucket: TokenBucket, tokens_needed: int, request_id: UUID):
        try:
            chain = self.token_bucket_repository.get_bucket_chain(bucket)

            bucket_ids = [b.id for b in chain]

            # Lock the full hierarchy while calculating and creating reservation holds.
            self.token_bucket_repository.lock_buckets(bucket_ids)

            remaining = tokens_needed
            reservations: list[TokenReservation] = []

            for bucket in chain:
                if remaining <= 0:
                    break

                period_key = get_period_key(bucket.period_type)

                balance = self.token_balance_repository.get_balance(
                    subject_type=bucket.subject_type,
                    subject_id=bucket.subject_id,
                    model_id=bucket.model_id,
                    period_key=period_key,
                )

                used = balance.used_tokens if balance else 0
                reserved = self.token_reservation_repository.get_active_reserved_tokens(
                    bucket_id=bucket.id,
                    period_key=period_key,
                    exclude_request_id=request_id,
                )
                available = bucket.token_limit - used - reserved

                if available <= 0:
                    continue

                reserve = min(available, remaining)

                reservation = TokenReservation(
                    request_id=request_id,
                    bucket_id=bucket.id,
                    reserved_tokens=reserve,
                    period_key=period_key,
                    expires_at=utcnow() + timedelta(minutes=5),
                )

                self.token_reservation_repository.session.add(reservation)
                reservations.append(reservation)
                remaining -= reserve

            if remaining > 0:
                raise QuotaExceededException("Quota exceeded")

            self.token_reservation_repository.session.flush()

            return reservations
        except Exception:
            self.token_reservation_repository.session.rollback()
            raise

    def commit_usage(self, reservations: list[TokenReservation], tokens_used: int):
        try:
            total_reserved = sum(
                reservation.reserved_tokens for reservation in reservations
            )
            if tokens_used > total_reserved:
                raise QuotaExceededException("Usage exceeded reserved quota")

            remaining = tokens_used

            for reservation in reservations:
                if remaining <= 0:
                    break

                debit = min(reservation.reserved_tokens, remaining)

                bucket = self.token_bucket_repository.get_by(
                    "id", reservation.bucket_id, unique=True
                )

                ledger = TokenLedger(
                    bucket_id=bucket.id,
                    tokens=-debit,
                    entry_type="usage",
                    period_key=reservation.period_key,
                )

                self.token_ledger_repository.session.add(ledger)

                balance = self.token_balance_repository.get_balance(
                    subject_type=bucket.subject_type,
                    subject_id=bucket.subject_id,
                    model_id=bucket.model_id,
                    period_key=reservation.period_key,
                )

                if not balance:
                    balance = TokenBalance(
                        subject_type=bucket.subject_type,
                        subject_id=bucket.subject_id,
                        model_id=bucket.model_id,
                        period_key=reservation.period_key,
                        used_tokens=0,
                    )

                balance.used_tokens += debit

                self.token_balance_repository.session.add(balance)

                remaining -= debit

            self.token_reservation_repository.delete_reservations(reservations)
            self.token_balance_repository.session.flush()
            self.token_balance_repository.session.commit()
        except Exception:
            self.token_balance_repository.session.rollback()
            raise

    def refund_tokens(self, reservations: list[TokenReservation]):
        try:
            self.token_reservation_repository.delete_reservations(reservations)
            self.token_reservation_repository.session.commit()
        except Exception:
            self.token_reservation_repository.session.rollback()
            raise

    def get_user_bucket(self, user_id: UUID, model_id: UUID):
        return self.token_bucket_repository.get_user_bucket(user_id, model_id)

    def get_user_token_usage_per_model(self, user_id: UUID, model_identifier: str):
        model = self.llm_model_repository.get_model(model_identifier)

        user_bucket = self.get_user_bucket(user_id, model.id)

        if not user_bucket:
            raise NotFoundException("No user bucket found")

        bucket_chain = self.token_bucket_repository.get_bucket_chain(user_bucket)

        result = TokenUsage(total_limit=0, total_used=0, total_remaining=0, buckets=[])

        for bucket in bucket_chain:
            period_key = get_period_key(bucket.period_type)

            balance = self.token_balance_repository.get_balance(
                subject_type=bucket.subject_type,
                subject_id=bucket.subject_id,
                model_id=model.id,
                period_key=period_key,
            )

            used = balance.used_tokens if balance else 0
            remaining = bucket.token_limit - used

            result.buckets.append(
                TokenUsagePerBucket(
                    subject_type=bucket.subject_type,
                    subject_id=bucket.subject_id,
                    subject=get_token_subject(
                        self.token_ledger_repository.session,
                        bucket.subject_type,
                        bucket.subject_id,
                    ),
                    limit=bucket.token_limit,
                    used=used,
                    remaining=max(remaining, 0),
                )
            )

            result.total_limit += bucket.token_limit
            result.total_used += used

        result.total_remaining = max(result.total_limit - result.total_used, 0)

        return result
