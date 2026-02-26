from uuid import UUID

from sqlmodel import func, or_, select

from src.core.controller.base import BaseController
from src.models.models import User
from src.models.pagination import get_pagination

from .repository import UserRepository
from .schema import PaginatedFilterParams


class UserController(BaseController[User]):
    def __init__(self, repository: UserRepository) -> None:
        super().__init__(model=User, repository=repository)
        self.repository = repository

    def get_users(self, query: PaginatedFilterParams):
        base_statement = self.repository._query()
        count_statement = select(func.count()).select_from(self.model_class)

        if query.organization_id is not None:
            base_statement = base_statement.where(
                User.organization_id == query.organization_id
            )
            count_statement = count_statement.where(
                User.organization_id == query.organization_id
            )

        if query.search is not None:
            base_statement = base_statement.where(
                or_(
                    User.first_name.ilike(f"%{query.search}%"),  # type: ignore
                    User.last_name.ilike(f"%{query.search}%"),  # type: ignore
                )
            )
            count_statement = count_statement.where(
                or_(
                    User.first_name.ilike(f"%{query.search}%"),  # type: ignore
                    User.last_name.ilike(f"%{query.search}%"),  # type: ignore
                )
            )

        base_statement = base_statement.order_by(
            User.created_at.desc(),  # type: ignore
            User.id.desc(),  # type: ignore
        )
        statement = base_statement.offset(query.page * query.limit).limit(query.limit)
        users = self.repository.session.exec(statement).all()

        count = self.repository.session.exec(count_statement).one()

        pagination = get_pagination(query.page, query.limit, count)

        return users, pagination

    def attach_organization(self, user_id: UUID, organization_id: UUID):
        user = self.get_by_id(user_id)
        user = self.repository.update(user_id, {"organization_id": organization_id})
        return user

    def attach_division(self, user_id: UUID, division_id: UUID):
        user = self.get_by_id(user_id)
        user = self.repository.update(user_id, {"division_id": division_id})
        return user
