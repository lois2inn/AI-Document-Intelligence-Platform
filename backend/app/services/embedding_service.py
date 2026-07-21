from app.providers.embedding_provider import EmbeddingProvider
from app.providers.provider_factory import get_embedding_provider

class EmbeddingService:
    def __init__(self) -> None:
        self.provider: EmbeddingProvider = get_embedding_provider()

    def generate_embedding(self, text: str) -> list[float]:
        return self.provider.generate_embedding(text)
    

    def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        return self.provider.generate_embeddings(texts)

    
    def embed_query(self, query: str) -> list[float]:
        return self.provider.generate_embedding(query)
        