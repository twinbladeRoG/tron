from fastapi import APIRouter

from src.models.models import Organization

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.get("/", response_model=list[Organization])
def get_organizations():
    return []
