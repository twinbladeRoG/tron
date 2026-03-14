from uuid import UUID

from sqlmodel import Session, select

from src.models.models import (
    Division,
    Organization,
    Team,
    User,
)
from src.utils.time import utcnow


def get_period_key():
    now = utcnow()
    return f"{now.year}-{now.month:02}"


def get_token_subject(session: Session, subject_type: str, subject_id: UUID):
    match subject_type:
        case "user":
            return session.exec(select(User).where(User.id == subject_id)).first()
        case "team":
            return session.exec(select(Team).where(Team.id == subject_id)).first()
        case "division":
            return session.exec(
                select(Division).where(Division.id == subject_id)
            ).first()
        case "organization":
            return session.exec(
                select(Organization).where(Organization.id == subject_id)
            ).first()
        case _:
            return None
