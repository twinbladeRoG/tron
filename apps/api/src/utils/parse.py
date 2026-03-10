import json
import uuid


def json_to_dict(json_str):
    """
    Converts a JSON string to a dictionary if valid,
    otherwise returns the original string.
    """
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return json_str


def is_valid_uuid(uuid_string: str, *, version=4):
    try:
        uuid_obj = uuid.UUID(uuid_string, version=version)
    except ValueError:
        return uuid_string

    return uuid_obj
