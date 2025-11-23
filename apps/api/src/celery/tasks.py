from uuid import UUID

from src.core.dependencies import get_database_session

from .app import app

session_generator = get_database_session()
session = next(session_generator)


@app.task(name="parse_document")
def parse_document(file_uri: str, file_id: UUID):
    return None
