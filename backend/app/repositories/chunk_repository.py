
from sqlalchemy import text
from sqlalchemy.orm import Session

class ChunkRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def semantic_search(self, query_embedding: list[float], limit: int = 5):
        sql = text("""
            SELECT
                dc.id AS chunk_id,
                dc.document_id,
                dc.chunk_index,
                dc.content AS text,
                d.title AS title,
                d.file_name AS file_name,
                d.source_type AS source_type,
                1 - (dc.embedding <=> CAST(:query_embedding AS vector)) AS similarity_score
            FROM document_chunks AS dc
            JOIN documents AS d ON dc.document_id = d.id
            WHERE dc.embedding IS NOT NULL
            ORDER BY dc.embedding <=> CAST(:query_embedding AS vector)
            LIMIT :limit
        """)

        return self.db.execute(
            sql,
            {
                "query_embedding": str(query_embedding),
                "limit": limit,
            },
        ).mappings().all()