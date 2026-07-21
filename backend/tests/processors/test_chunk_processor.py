import pytest

from app.processors.chunk_processor import chunk_text


def test_returns_empty_list_for_empty_text():
    assert chunk_text("") == []
    assert chunk_text("   ") == []


def test_rejects_non_positive_chunk_size():
    with pytest.raises(
        ValueError,
        match="chunk_size must be greater than 0",
    ):
        chunk_text(
            "Some text",
            chunk_size=0,
        )


def test_rejects_negative_overlap():
    with pytest.raises(
        ValueError,
        match="overlap cannot be negative",
    ):
        chunk_text(
            "Some text",
            overlap=-1,
        )


def test_rejects_overlap_equal_to_chunk_size():
    with pytest.raises(
        ValueError,
        match="overlap must be smaller than chunk_size",
    ):
        chunk_text(
            "Some text",
            chunk_size=100,
            overlap=100,
        )


def test_rejects_negative_minimum_chunk_size():
    with pytest.raises(
        ValueError,
        match="min_chunk_size cannot be negative",
    ):
        chunk_text(
            "Some text",
            min_chunk_size=-1,
        )

# Add boundary tests
def test_prefers_paragraph_boundary():
    text = (
        "This is the first paragraph with enough content.\n\n"
        "This is the second paragraph with more content."
    )

    chunks = chunk_text(
        text,
        chunk_size=60,
        overlap=10,
        min_chunk_size=10,
    )

    assert chunks[0].content.endswith("content.")


def test_prefers_sentence_boundary_when_no_paragraph_boundary():
    text = (
        "This is the first sentence. "
        "This is the second sentence. "
        "This is the third sentence."
    )

    chunks = chunk_text(
        text,
        chunk_size=50,
        overlap=10,
        min_chunk_size=10,
    )

    assert chunks[0].content.endswith(".")

# Test offsets
def test_chunk_offsets_match_original_text():
    text = (
        "First paragraph contains useful information.\n\n"
        "Second paragraph contains additional information."
    )

    normalized_text = text.strip()

    chunks = chunk_text(
        text,
        chunk_size=65,
        overlap=10,
        min_chunk_size=10,
    )

    for chunk in chunks:
        extracted = normalized_text[
            chunk.start_char:chunk.end_char
        ]

        assert extracted == chunk.content
        assert chunk.end_char > chunk.start_char

# Test overlap
def test_adjacent_chunks_have_overlap():
    text = " ".join(
        f"Sentence {index} contains useful information."
        for index in range(20)
    )

    chunks = chunk_text(
        text,
        chunk_size=180,
        overlap=40,
        min_chunk_size=20,
    )

    assert len(chunks) > 1

    for previous, current in zip(chunks, chunks[1:]):
        assert current.start_char < previous.end_char


# Test broken words
def test_chunks_do_not_start_in_the_middle_of_a_word():
    text = (
        "Programming languages allow developers to create "
        "reliable and maintainable applications."
    )

    chunks = chunk_text(
        text,
        chunk_size=35,
        overlap=8,
        min_chunk_size=5,
    )

    normalized_text = text.strip()

    for chunk in chunks[1:]:
        if chunk.start_char > 0:
            previous_character = normalized_text[chunk.start_char - 1]

            assert previous_character.isspace()

# test tiny trailing spaces
def test_tiny_trailing_chunk_is_merged():
    text = (
        "This paragraph contains enough material to create the primary "
        "chunk and demonstrate how the chunking algorithm works. "
        "Tiny ending."
    )

    chunks = chunk_text(
        text,
        chunk_size=115,
        overlap=10,
        min_chunk_size=30,
    )

    assert len(chunks[-1].content) >= 30