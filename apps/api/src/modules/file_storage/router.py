from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, UploadFile
from fastapi.responses import FileResponse

from src.core.dependencies import CurrentUser, FileControllerDeps
from src.core.exception import NotFoundException
from src.models.models import File
from src.models.pagination import FilePaginated

from .schema import PaginatedFilterParams

router = APIRouter(prefix="/file-storage", tags=["File Storage"])


@router.get("/", response_model=FilePaginated)
def get_all_files(
    file_controller: FileControllerDeps,
    user: CurrentUser,
    query: Annotated[PaginatedFilterParams, Query()],
):
    files, pagination = file_controller.get_users_files(user.id, query)
    return FilePaginated(data=list(files), pagination=pagination)


@router.post("/", response_model=File)
async def create_file(
    file: UploadFile,
    user: CurrentUser,
    file_controller: FileControllerDeps,
):
    return await file_controller.upload(user_id=user.id, file=file)


@router.get("/{file_id}", response_model=File)
def get_file(
    file_controller: FileControllerDeps,
    user: CurrentUser,
    file_id: UUID,
):
    return file_controller.get_user_file_by_id(id=file_id, user_id=user.id)


@router.get("/view/{filename}")
def view_file(
    file_controller: FileControllerDeps,
    filename: str,
):
    file = file_controller.get_file_by_filename(filename)
    file_path = file_controller._get_local_file_path(file.filename)

    if not file_path.exists():
        raise NotFoundException("File not found")

    if file.is_private:
        raise NotFoundException("File not found")

    inline_types = ["application/pdf", "image/png", "image/jpeg"]

    disposition = "inline" if file.content_type in inline_types else "attachment"

    return FileResponse(
        path=file_path,
        media_type=file.content_type,
        headers={
            "Content-Disposition": f'{disposition}; filename="{file.original_filename}"'
        },
    )


@router.delete("/{file_id}")
def delete_file(
    file_id: UUID,
    file_controller: FileControllerDeps,
    user: CurrentUser,
):
    return file_controller.remove_file(id=file_id, user_id=user.id)


@router.patch("/{file_id}/mark-as-private")
def mark_file_as_private(
    user: CurrentUser, file_id: UUID, file_controller: FileControllerDeps
):
    return file_controller.mark_file_as_private(file_id, user.id)


@router.patch("/{file_id}/mark-as-public")
def mark_file_as_public(
    user: CurrentUser, file_id: UUID, file_controller: FileControllerDeps
):
    return file_controller.mark_file_as_public(file_id, user.id)
