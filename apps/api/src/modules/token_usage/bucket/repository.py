from uuid import UUID

from sqlmodel import func, select

from src.core.logger import logger
from src.core.repository.base import BaseRepository
from src.models.models import TokenBucket
from src.models.pagination import get_pagination
from src.models.response import TokenBucketWithSubject

from ..utils import get_token_subject
from .schema import ModelBucketQueryParams


class TokenBucketRepository(BaseRepository[TokenBucket]):
    def get_bucket_chain(self, bucket: TokenBucket):
        chain: list[TokenBucket] = []
        current: TokenBucket | None = bucket

        while current:
            chain.append(current)

            if not current.parent_bucket_id:
                break

            parent = self.session.get(TokenBucket, current.parent_bucket_id)

            if not parent:
                logger.debug(f"Parent bucket {current.parent_bucket_id} not found")
                break

            current = parent

        return chain

    def lock_buckets(self, bucket_ids: list[UUID]):
        statement = (
            self._query().where(TokenBucket.id.in_(bucket_ids)).with_for_update()  # type: ignore
        )
        return self.session.exec(statement).all()

    def get_user_bucket(self, user_id: UUID, model_id: UUID):
        statement = self._query().where(
            TokenBucket.subject_id == user_id,
            TokenBucket.subject_type == "user",
            TokenBucket.model_id == model_id,
        )
        return self.session.exec(statement).first()

    def get_model_buckets(self, model_id: UUID, query: ModelBucketQueryParams):
        base_statement = self._query().where(TokenBucket.model_id == model_id)
        count_statement = (
            select(func.count())
            .select_from(self.model_class)
            .where(TokenBucket.model_id == model_id)
        )

        if query.subject_type:
            base_statement = base_statement.where(
                TokenBucket.subject_type == query.subject_type
            )
            count_statement = count_statement.where(
                TokenBucket.subject_type == query.subject_type
            )

        if query.subject_id:
            base_statement = base_statement.where(
                TokenBucket.subject_id == query.subject_id
            )
            count_statement = count_statement.where(
                TokenBucket.subject_id == query.subject_id
            )

        if query.period_type:
            base_statement = base_statement.where(
                TokenBucket.period_type == query.period_type
            )
            count_statement = count_statement.where(
                TokenBucket.period_type == query.period_type
            )

        statement = base_statement.offset(query.page * query.limit).limit(query.limit)
        buckets = self.session.exec(statement).all()

        count = self.session.exec(count_statement).one()

        pagination = get_pagination(query.page, query.limit, count)

        buckets = [
            TokenBucketWithSubject(
                **bucket.model_dump(),
                subject=get_token_subject(
                    session=self.session,
                    subject_type=bucket.subject_type,
                    subject_id=bucket.subject_id,
                ),
            )
            for bucket in buckets
        ]

        return buckets, pagination
