from src.models.models import User

from .types import Context


def build_user_context(user: User):
    context = Context(
        organization=user.organization.slug if user.organization else None,
        division=user.division.slug if user.division else None,
        teams=[team.slug for team in user.teams],
    )

    return context
