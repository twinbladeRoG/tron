from uuid import UUID

from src.core.controller.base import BaseController
from src.models.models import Organization
from src.models.pagination import get_pagination

from .repository import OrganizationRepository
from .schema import OrganizationBase, PaginatedFilterParams


class OrganizationController(BaseController[Organization]):
    def __init__(self, repository: OrganizationRepository) -> None:
        super().__init__(model=Organization, repository=repository)
        self.repository = repository

    def get_all_organizations(self, query: PaginatedFilterParams):
        total_records = self.repository.count()
        pagination = get_pagination(query.page, query.limit, total_records)
        result = self.get_all(skip=query.page * query.limit, limit=query.limit)
        return list(result), pagination

    def get_organization_by_id(self, id: UUID):
        return self.get_by_id(id)

    def add_organization(self, data: OrganizationBase):
        return self.create(data)

    def update_organization(self, id: UUID, data: OrganizationBase):
        return self.repository.update(id, data.model_dump())

    def remove_organization(self, id: UUID):
        organization = self.get_organization_by_id(id)
        self.repository.delete(organization)
        return organization
