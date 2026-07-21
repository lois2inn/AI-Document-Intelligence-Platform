from __future__ import annotations

from typing import Protocol


class ChatProvider(Protocol):
    def generate(self, messages: list[dict[str, str]]) -> str:
        ...
