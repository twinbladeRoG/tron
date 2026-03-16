from sqlmodel import SQLModel

from src.modules.users.schema import UserPublic


class Tokens(SQLModel):
    access_token: str
    refresh_token: str


class TokenWithUser(SQLModel):
    user: UserPublic
    tokens: Tokens

    access_token: str  # NOTE: Needed for OAuth2PasswordBearer
    token_type: str  # NOTE: Needed for OAuth2PasswordBearer


class TokenPayload(SQLModel):
    sub: str | None = None
