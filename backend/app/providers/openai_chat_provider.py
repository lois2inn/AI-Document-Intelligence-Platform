from __future__ import annotations

from app.core.config import settings
from app.providers.chat_provider import ChatProvider
from app.providers.openai_clients import get_openai_client


class OpenAIChatProvider(ChatProvider):
    def __init__(self) -> None:
        self._client = get_openai_client()
        self._model = settings.chat_model

    def generate(self, messages: list[dict[str, str]]) -> str:
        response = self._client.chat.completions.create(
            model=self._model,
            messages=messages,
            temperature=0.2,
        )

        return response.choices[0].message.content or ""
