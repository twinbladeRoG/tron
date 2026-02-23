from math import ceil
from typing import Generic, List, TypeVar

from pydantic.generics import GenericModel
from sqlmodel import SQLModel

from .models import Division, Organization


class Pagination(SQLModel):
    page: int
    limit: int
    total_pages: int
    total_count: int
    has_next: bool
    has_previous: bool


def get_pagination(page: int, limit: int, count: int) -> Pagination:
    total_pages = ceil(count / limit)

    pagination = Pagination(
        page=page,
        limit=limit,
        total_count=count,
        total_pages=total_pages,
        has_next=True if page != total_pages - 1 and page < total_pages - 1 else False,
        has_previous=True if page != 0 and page <= total_pages - 1 else False,
    )

    return pagination


T = TypeVar("T", bound=SQLModel)


class ModelPaginated(GenericModel, Generic[T]):
    data: List[T]
    pagination: Pagination


class OrganizationPaginated(ModelPaginated[Organization]):
    pass


class DivisionPaginated(ModelPaginated[Division]):
    pass
