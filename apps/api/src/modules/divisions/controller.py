from uuid import UUID

from sqlmodel import func, select

from src.core.controller.base import BaseController
from src.models.models import Division
from src.models.pagination import get_pagination

from .repository import DivisionRepository
from .schema import CreateDivision, PaginatedFilterParams


class DivisionController(BaseController[Division]):
    def __init__(self, repository: DivisionRepository) -> None:
        super().__init__(model=Division, repository=repository)
        self.repository = repository

    def get_all_divisions(self, query: PaginatedFilterParams):
        base_statement = self.repository._query()
        count_statement = select(func.count()).select_from(self.model_class)

        if query.organization is not None:
            base_statement = base_statement.where(
                Division.organization.slug == query.organization
            )
            count_statement = count_statement.where(
                Division.organization.slug == query.organization
            )

        if query.search is not None:
            base_statement = base_statement.where(
                Division.name.ilike(f"%{query.search}%")  # type: ignore
            )
            count_statement = count_statement.where(
                Division.name.ilike(f"%{query.search}%")  # type: ignore
            )

        base_statement = base_statement.order_by(
            Division.created_at.desc(),  # type: ignore
            Division.id.desc(),  # type: ignore
        )
        statement = base_statement.offset(query.page * query.limit).limit(query.limit)
        divisions = self.repository.session.exec(statement).all()

        count = self.repository.session.exec(count_statement).one()

        pagination = get_pagination(query.page, query.limit, count)

        return divisions, pagination

    def get_division_by_id(self, id: UUID):
        return self.get_by_id(id)

    def add_division(self, data: CreateDivision):
        return self.create(data)

    def update_division(self, id: UUID, data: CreateDivision):
        return self.repository.update(id, data.model_dump())

    def remove_division(self, id: UUID):
        division = self.get_division_by_id(id)
        self.repository.delete(division)
        return division
