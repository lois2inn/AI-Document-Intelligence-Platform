from datetime import datetime

from pydantic import BaseModel


class DocumentChunkRead(BaseModel):
    id: int
    document_id: int
    chunk_index: int
    content: str
    char_count: int
    start_char: int | None = None
    end_char: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}