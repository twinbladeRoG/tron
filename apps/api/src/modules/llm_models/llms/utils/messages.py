from typing import Any


def get_message_text(content: Any) -> str:
    """Normalize provider-specific message content into plain text.

    Why this exists:
    OpenAI-style chat models usually return message content as a simple string,
    but other providers can return structured content blocks instead. Bedrock,
    and sometimes other LangChain integrations, may produce a list of blocks
    such as `[{ "text": "hello" }]` instead of `"hello"`.

    The rest of the app expects text when it:
    - streams chunks to the frontend as `{"text": ...}`
    - stores final AI responses in the database
    - appends incremental content while a response is streaming

    Without this helper, those paths would either emit raw Python lists/dicts,
    persist serialized block structures instead of readable text, or require
    provider-specific conditionals throughout the chat and callback code.

    This keeps provider differences localized to one place and lets upstream
    code treat model output as text whenever the provider response includes
    text-bearing blocks.
    """
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: list[str] = []

        for block in content:
            if isinstance(block, str):
                parts.append(block)
                continue

            if not isinstance(block, dict):
                continue

            text = block.get("text")
            if isinstance(text, str):
                parts.append(text)
                continue

            if block.get("type") == "text" and isinstance(block.get("text"), str):
                parts.append(block["text"])

        return "".join(parts)

    if content is None:
        return ""

    return str(content)
