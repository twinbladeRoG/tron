from uuid import UUID

from src.core.controller.base import BaseController
from src.core.exception import BadRequestException, NotFoundException
from src.models.models import TokenBucket, User

from .repository import TokenBucketRepository
from .schema import CreateUserTokenBucket, ModelBucketQueryParams, TokenBucketBase


class TokenBucketController(BaseController[TokenBucket]):
    def __init__(self, repository: TokenBucketRepository) -> None:
        super().__init__(model=TokenBucket, repository=repository)
        self.repository = repository

    def get_user_buckets(self, user: User, model_id: UUID):
        user_base_bucket = self.repository.get_user_bucket(user.id, model_id)

        if not user_base_bucket:
            raise NotFoundException(f"Not user level bucket found for this user")

        buckets = self.repository.get_bucket_chain(user_base_bucket)

        return buckets

    def create_user_bucket(self, user: User, data: CreateUserTokenBucket):
        user_base_bucket = self.repository.get_user_bucket(user.id, data.model_id)

        if user_base_bucket:
            raise BadRequestException("User level bucket already exists")

        bucket = TokenBucketBase(
            subject_type="user",
            subject_id=user.id,
            model_id=data.model_id,
            period_type=data.period_type,
            token_limit=data.token_limit,
        )

        return self.repository.create(bucket.model_dump())

    def create_bucket(self, data: TokenBucketBase):
        return self.create(data)

    def get_all_model_buckets(self, model_id: UUID, query: ModelBucketQueryParams):
        return self.repository.get_model_buckets(model_id, query)
