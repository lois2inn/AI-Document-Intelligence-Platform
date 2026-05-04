from sqlalchemy.orm import Session

from app.models.document_chunk import DocumentChunk


class ChunkRepository:
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