import re
from dataclasses import dataclass

@dataclass(frozen=True)
class TextChunk:
    content: str
    start_char: int
    end_char: int

def chunk_text(
    text: str,
    chunk_size: int = 800,
    overlap: int = 120,
    min_chunk_size: int = 100,
) -> list[TextChunk]:
    """
    Split text into boundary-aware overlapping chunks.

    Strategy:
    1. Prefer paragraph boundaries.
    2. Fall back to sentence boundaries.
    3. Fall back to hard character boundaries for very long sentences.
    4. Merge a tiny trailing chunk into the previous chunk.
    """

    if not text or not text.strip():
        return []

    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0")

    if overlap < 0:
        raise ValueError("overlap cannot be negative")

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    if min_chunk_size < 0:
        raise ValueError("min_chunk_size cannot be negative")

    normalized_text = text.strip()

    chunks: list[TextChunk] = []
    start = 0
    text_length = len(normalized_text)

    while start < text_length:
        target_end = min(start + chunk_size, text_length)

        if target_end < text_length:
            end = _find_best_boundary(
                text=normalized_text,
                start=start,
                target_end=target_end,
            )
        else:
            end = text_length

        if end <= start:
            end = target_end

        raw_chunk = normalized_text[start:end]
        leading_trim = len(raw_chunk) - len(raw_chunk.lstrip())
        trailing_trim = len(raw_chunk) - len(raw_chunk.rstrip())

        actual_start = start + leading_trim
        actual_end = end - trailing_trim
        content = normalized_text[actual_start:actual_end]

        if content:
            chunks.append(
                TextChunk(
                    content=content,
                    start_char=actual_start,
                    end_char=actual_end,
                )
            )

        if end >= text_length:
            break

        next_start = max(end - overlap, start + 1)
        next_start = _move_to_word_boundary(
            text=normalized_text,
            position=next_start,
        )

        start = next_start

    return _merge_tiny_trailing_chunk(
        chunks=chunks,
        text=normalized_text,
        min_chunk_size=min_chunk_size,
        chunk_size=chunk_size,
    )


def _find_best_boundary(
    text: str,
    start: int,
    target_end: int,
) -> int:
    search_text = text[start:target_end]

    paragraph_matches = list(re.finditer(r"\n\s*\n", search_text))

    if paragraph_matches:
        boundary = start + paragraph_matches[-1].end()

        if boundary > start:
            return boundary

    sentence_matches = list(
        re.finditer(r"(?<=[.!?])(?:[\"')\]]*)\s+", search_text)
    )

    if sentence_matches:
        boundary = start + sentence_matches[-1].end()

        if boundary > start:
            return boundary

    whitespace_position = search_text.rfind(" ")

    if whitespace_position > 0:
        return start + whitespace_position + 1

    return target_end


def _move_to_word_boundary(
    text: str,
    position: int,
) -> int:
    if position <= 0 or position >= len(text):
        return position

    while position < len(text) and not text[position].isspace():
        position += 1

    while position < len(text) and text[position].isspace():
        position += 1

    return position


def _merge_tiny_trailing_chunk(
    chunks: list[TextChunk],
    text: str,
    min_chunk_size: int,
    chunk_size: int,
) -> list[TextChunk]:
    if len(chunks) < 2:
        return chunks

    last_chunk = chunks[-1]

    if len(last_chunk.content) >= min_chunk_size:
        return chunks

    previous_chunk = chunks[-2]

    merged_start = previous_chunk.start_char
    merged_end = last_chunk.end_char
    merged_content = text[merged_start:merged_end].strip()

    # Avoid creating an excessively large merged chunk.
    if len(merged_content) > chunk_size + min_chunk_size:
        return chunks

    merged_chunk = TextChunk(
        content=merged_content,
        start_char=merged_start,
        end_char=merged_end,
    )

    return [*chunks[:-2], merged_chunk]