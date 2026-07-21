
from app.services.embedding_service import EmbeddingService
from app.repositories.chunk_repository import ChunkRepository

class SearchService:
    def __init__(self, db):
        self.db = db
        self.embedding_service = EmbeddingService()
        self.chunk_repo = ChunkRepository(db)

    def semantic_search(self, query: str, limit: int = 5):
        query_embedding = self.embedding_service.embed_query(query)

        results = self.chunk_repo.semantic_search(
            query_embedding=query_embedding,
            limit=limit,
        )

        return results