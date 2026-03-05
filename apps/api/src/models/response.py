from typing import Optional
from uuid import UUID

from sqlmodel import Field

from src.models.mixins import BaseModelMixin
from src.models.models import Division, File, Organization, Team, User
from src.modules.divisions.schema import DivisionBase
from src.modules.knowledge_base.schema import KnowledgeBaseBase
from src.modules.teams.schema import TeamBase
from src.modules.users.schema import UserPublic


class UserPublicExtended(UserPublic):
    organization_id: Optional[UUID]
    organization: Optional[Organization]
    division_id: Optional[UUID]
    division: Optional[Division]
    teams: list[Team]


class DivisionWithOrganization(BaseModelMixin, DivisionBase):
    organization_id: UUID
    organization: Organization


class TeamExtended(BaseModelMixin, TeamBase):
    division_id: UUID
    division: DivisionWithOrganization


class KnowledgeBaseExtended(BaseModelMixin, KnowledgeBaseBase):
    owner_id: UUID = Field(default=None)
    owner: User = Field(default=None)
    files: list[File] = Field(default_factory=list)
