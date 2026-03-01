import json


def json_to_dict(json_str):
    """
    Converts a JSON string to a dictionary if valid,
    otherwise returns the original string.
    """
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return json_str
