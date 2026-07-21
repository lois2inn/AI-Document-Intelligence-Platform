from __future__ import annotations

from app.core.config import settings
from app.providers.chat_provider import ChatProvider
from app.providers.embedding_provider import EmbeddingProvider
from app.providers.openai_chat_provider import OpenAIChatProvider
from app.providers.openai_embedding_provider import OpenAIEmbeddingProvider
from app.providers.openrouter_chat_provider import OpenRouterChatProvider
from app.providers.openrouter_embedding_provider import OpenRouterEmbeddingProvider


def get_embedding_provider() -> EmbeddingProvider:
    provider = (settings.embedding_provider or "openrouter").lower()

    if provider == "openrouter":
        return OpenRouterEmbeddingProvider()

    if provider == "openai":
        return OpenAIEmbeddingProvider()

    raise ValueError(f"Unsupported embedding_provider: {settings.embedding_provider}")


def get_chat_provider() -> ChatProvider:
    provider = (settings.chat_provider or "openrouter").lower()

    if provider == "openrouter":
        return OpenRouterChatProvider()

    if provider == "openai":
        return OpenAIChatProvider()

    raise ValueError(f"Unsupported chat_provider: {settings.chat_provider}")
