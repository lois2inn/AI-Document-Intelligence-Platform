from pydantic import BaseModel
from datetime import datetime

class DocumentJobRead(BaseModel):
    id: int
    document_id: int
    stage: str
    status: str
    error_message: str | None
    retry_count: int
    started_at: datetime | None
    completed_at: datetime | None
    duration_seconds: float | None = None
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }