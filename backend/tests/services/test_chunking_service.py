from app.services.chunking_service import ChunkingService


def test_create_chunks_returns_repository_payloads():
    text = (
        "This is the first sentence. "
        "This is the second sentence with more content."
    )

    service = ChunkingService()

    chunks = service.create_chunks(text)

    assert chunks

    for index, chunk in enumerate(chunks):
        assert chunk["chunk_index"] == index
        assert chunk["content"]
        assert chunk["char_count"] == len(chunk["content"])
        assert isinstance(chunk["start_char"], int)
        assert isinstance(chunk["end_char"], int)
        assert chunk["end_char"] > chunk["start_char"]