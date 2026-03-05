import os
from pathlib import Path
from typing import Callable
from uuid import UUID

import aiofiles
from cuid2 import cuid_wrapper
from fastapi import UploadFile
from sqlalchemy import or_
from sqlmodel import col, func, select

from src.core.controller.base import BaseController
from src.core.exception import BadRequestException, NotFoundException
from src.models.models import File
from src.models.pagination import get_pagination

from .repository import FileRepository
from .schema import FileCreate, PaginatedFilterParams

cuid_generator: Callable[[], str] = cuid_wrapper()


class FileController(BaseController[File]):
    UPLOAD_PATH = Path("uploads")

    def __init__(self, repository: FileRepository) -> None:
        super().__init__(model=File, repository=repository)
        self.repository = repository

    @staticmethod
    def _get_local_file_path(file_name: str):
        """
        Get the file path for a given file name.
        """
        file_path = FileController.UPLOAD_PATH / file_name

        return file_path

    def get_users_files(self, user_id: UUID, query: PaginatedFilterParams):
        base_statement = self.repository._query().where(
            self.model_class.owner_id == user_id
        )

        if query.search:
            search_term = f"%{query.search.strip()}%"
            base_statement = base_statement.where(
                or_(
                    self.model_class.filename.ilike(search_term),  # type: ignore
                    self.model_class.original_filename.ilike(search_term),  # type: ignore
                )
            )

        if query.file_types and len(query.file_types) > 0:
            base_statement = base_statement.where(
                self.model_class.content_type.in_(query.file_types)  # type: ignore
            )

        if query.exclude_ids and len(query.exclude_ids) > 0:
            base_statement = base_statement.where(
                self.model_class.id.notin_(query.exclude_ids)  # type: ignore
            )

        base_statement = base_statement.order_by(File.created_at.desc(), File.id.desc())  # type: ignore

        statement = base_statement.offset(query.page * query.limit).limit(query.limit)
        results = self.repository.session.exec(statement).all()

        count_statement = (
            select(func.count())
            .select_from(self.model_class)
            .where(self.model_class.owner_id == user_id)
        )

        if query.search:
            search_term = f"%{query.search.strip()}%"
            count_statement = count_statement.where(
                or_(
                    self.model_class.filename.ilike(search_term),  # type: ignore
                    self.model_class.original_filename.ilike(search_term),  # type: ignore
                )
            )

        if query.file_types:
            count_statement = count_statement.where(
                self.model_class.content_type.in_(query.file_types)  # type: ignore
            )

        if query.exclude_ids and len(query.exclude_ids) > 0:
            count_statement = count_statement.where(
                self.model_class.id.notin_(query.exclude_ids)  # type: ignore
            )

        count = self.repository.session.exec(count_statement).one()

        pagination = get_pagination(query.page, query.limit, count)

        return results, pagination

    def get_user_file_by_id(self, id: UUID, user_id: UUID) -> File:
        base_statement = self.repository._query().where(
            File.id == id, File.owner_id == user_id
        )
        result = self.repository.session.exec(base_statement).one_or_none()

        if result is None:
            raise NotFoundException(f"No file found with id: {id}")

        return result

    def get_user_files_by_ids(self, ids: list[UUID], user_id: UUID) -> list[File]:
        base_statement = self.repository._query().where(
            col(File.id).in_(ids), File.owner_id == user_id
        )
        result = self.repository.session.exec(base_statement).all()

        return list(result)

    def get_file_by_filename(self, filename: str):
        file = self.repository.get_file_by_filename(filename)

        if file is None:
            raise NotFoundException("No file found")

        return file

    async def upload(self, user_id: UUID, file: UploadFile):
        if file.filename is None:
            raise BadRequestException("File does not have valid filename")

        if file.content_type is None:
            raise BadRequestException("File does not a valid content type")

        file_name = file.filename.split(".")[0]
        file_extension = file.filename.split(".")[-1]
        new_file_name = (
            f"{file_name.replace(' ', '_')}_{cuid_generator()}.{file_extension}"
        )

        file_path = self._get_local_file_path(new_file_name)
        dir_path = file_path.parent

        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)

        async with aiofiles.open(file_path, "wb") as saved_file:
            content = await file.read()
            await saved_file.write(content)
            await file.close()
            await saved_file.close()

            document = FileCreate(
                filename=new_file_name,
                original_filename=file.filename,
                content_type=file.content_type,
                content_length=len(content),
                owner_id=user_id,
                is_private=False,
            )

            document = File.model_validate(document)

            return super().create(document)

    def remove_file(self, id: UUID, user_id: UUID):
        document = self.get_user_file_by_id(id, user_id)
        file_path = self._get_local_file_path(document.filename)

        self.repository.delete(document)

        if not file_path.exists():
            raise NotFoundException("Document does not exists")

        os.remove(file_path)

        return document

    def mark_file_as_private(self, id: UUID, user_id: UUID):
        file = self.get_user_file_by_id(id, user_id)
        return self.repository.mark_file_as_private(file.id)

    def mark_file_as_public(self, id: UUID, user_id: UUID):
        file = self.get_user_file_by_id(id, user_id)
        return self.repository.mark_file_as_public(file.id)
