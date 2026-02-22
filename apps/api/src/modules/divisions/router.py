from fastapi import APIRouter

from src.models.models import Division

router = APIRouter(prefix="/divisions", tags=["Divisions"])


@router.get("/", response_model=list[Division])
def get_divisions():
    return []
