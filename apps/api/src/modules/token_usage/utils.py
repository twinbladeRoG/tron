from datetime import datetime
from uuid import UUID

from sqlmodel import Session, select

from src.core.exception import BadRequestException
from src.models.models import (
    Division,
    Organization,
    Team,
    User,
)
from src.utils.time import utcnow


def get_period_key(period_type: str, now: datetime | None = None):
    current = now or utcnow()

    match period_type:
        case "daily":
            return current.strftime("%Y-%m-%d")
        case "weekly":
            iso_year, iso_week, _ = current.isocalendar()
            return f"{iso_year}-W{iso_week:02}"
        case "monthly":
            return current.strftime("%Y-%m")
        case "yearly":
            return current.strftime("%Y")
        case _:
            raise BadRequestException(f"Unsupported token bucket period_type: {period_type}")


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
