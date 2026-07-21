from __future__ import annotations

from abc import ABC
from typing import Protocol

from openai import OpenAI


class EmbeddingProvider(Protocol):
    def embed_query(self, query: str) -> list[float]:
        ...

    def generate_embedding(self, text: str) -> list[float]:
        ...

    def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        ...


class BaseEmbeddingProvider(ABC):
    def __init__(self, *, client: OpenAI, model: str) -> None:
        self._client = client
        self._model = model

    def generate_embedding(self, text: str) -> list[float]:
        if not text or not text.strip():
            raise ValueError("Cannot generate embedding for empty text")

        response = self._client.embeddings.create(
            model=self._model,
            input=text,
        )

        return response.data[0].embedding

    def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        for index, text in enumerate(texts):
            if not text or not text.strip():
                raise ValueError(f"Empty chunk content at index {index}")

        response = self._client.embeddings.create(
            model=self._model,
            input=texts,
        )

        return [item.embedding for item in response.data]

    def embed_query(self, query: str) -> list[float]:
        query = (query or "").strip()
        if not query:
            raise ValueError("Query cannot be empty")

        resp = self._client.embeddings.create(
            model=self._model,
            input=query,
        )

        return resp.data[0].embedding
