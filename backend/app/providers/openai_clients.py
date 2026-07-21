from __future__ import annotations

from openai import OpenAI

from app.core.config import settings


def get_openrouter_client() -> OpenAI:
    return OpenAI(
        api_key=settings.openrouter_api_key,
        base_url=settings.openrouter_base_url,
    )


def get_openai_client() -> OpenAI:
    if not settings.openai_api_key:
        raise ValueError(
            "OPENAI_API_KEY is required when using provider='openai'"
        )

    return OpenAI(
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
    )
