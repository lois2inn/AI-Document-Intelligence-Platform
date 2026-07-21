from pydantic import BaseModel

class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 5

class SemanticSearchResult(BaseModel):
    document_id: int
    chunk_id: int
    text: str
    similarity_score: float | None = None