from __future__ import annotations

from app.core.config import settings
from app.providers.embedding_provider import BaseEmbeddingProvider, EmbeddingProvider
from app.providers.openai_clients import get_openrouter_client


class OpenRouterEmbeddingProvider(BaseEmbeddingProvider, EmbeddingProvider):
    def __init__(self) -> None:
        super().__init__(client=get_openrouter_client(), model=settings.embedding_model)
