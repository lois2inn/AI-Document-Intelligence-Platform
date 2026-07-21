from app.processors.chunk_processor import chunk_text

class ChunkingService:
    def create_chunks(self, text: str) -> list[dict]:
        raw_chunks = chunk_text(
            text=text,
            chunk_size=800,
            overlap=120,
            min_chunk_size=100,
        )

        chunks: list[dict] = []

        for index, chunk in enumerate(raw_chunks):
            if not chunk.content:
                raise ValueError(
                    f"Empty chunk content at index {index}"
                )

            chunks.append(
                {
                    "chunk_index": index,
                    "content": chunk.content,
                    "char_count": len(chunk.content),
                    "start_char": chunk.start_char,
                    "end_char": chunk.end_char,
                }
            )

        return chunks