import json
import uuid
from typing import Any


def json_to_dict(json_str: str | Any):
    """
    Converts a JSON string to a dictionary if valid,
    otherwise returns the original string.
    """
    if not isinstance(json_str, str):
        return str(json_str)

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return json_str


def is_valid_uuid(uuid_string: str, *, version: int = 4):
    try:
        uuid_obj = uuid.UUID(uuid_string, version=version)
    except ValueError:
        return uuid_string

    return uuid_obj
