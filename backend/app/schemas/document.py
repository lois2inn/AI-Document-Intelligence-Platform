from datetime import datetime

from pydantic import BaseModel

from app.schemas.document_job import DocumentJobRead


class DocumentCreate(BaseModel):
    title: str
    source_type: str = "note"
    raw_text: str | None = None


class DocumentRead(BaseModel):
    id: int
    title: str
    source_type: str
    raw_text: str | None
    cleaned_text: str | None
    file_name: str | None
    file_path: str | None
    content_type: str | None
    status: str
    created_at: datetime
    chunk_count: int | None = None

    model_config = {"from_attributes": True}


class DocumentCreateResponse(BaseModel):
    document: DocumentRead
    job: DocumentJobRead