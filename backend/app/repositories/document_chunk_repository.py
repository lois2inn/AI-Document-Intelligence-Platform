from sqlalchemy.orm import Session

from app.models.document_chunk import DocumentChunk


class DocumentChunkRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_by_document_id(self, document_id: int) -> list[DocumentChunk]:
        return (
            self.db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index.asc())
            .all()
        )

    def count_by_document_id(self, document_id: int) -> int:
        return (
            self.db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .count()
        )
    
    def delete_by_document_id(self, document_id: int) -> None:
        (
            self.db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .delete()
        )
        self.db.flush()

    def create_many(self, document_id: int, chunks: list[dict]) -> list[DocumentChunk]:
        db_chunks: list[DocumentChunk] = []

        for chunk in chunks:
            content = chunk["content"].strip()
            if not content:
                raise ValueError(
                    f"Chunk {chunk.get('chunk_index')} has empty content"
                )

            db_chunks.append(
                DocumentChunk(
                    document_id=document_id,
                    chunk_index=chunk["chunk_index"],
                    content=content,
                    char_count=chunk.get("char_count") or len(content),
                    start_char=chunk.get("start_char"),
                    end_char=chunk.get("end_char"),
                )
            )

        self.db.add_all(db_chunks)
        self.db.flush()
        
        return db_chunks
    

    def update_embedding(
        self,
        chunk_id: int,
        embedding: list[float],
    ) -> None:
        chunk = (
            self.db.query(DocumentChunk)
            .filter(DocumentChunk.id == chunk_id)
            .first()
        )

        if chunk:
            chunk.embedding = embedding