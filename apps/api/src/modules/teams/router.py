from fastapi import APIRouter

from src.models.models import Team

router = APIRouter(prefix="/team", tags=["Teams"])


@router.get("/", response_model=list[Team])
def get_teams():
    return []
