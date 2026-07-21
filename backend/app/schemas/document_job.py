from pydantic import BaseModel
from datetime import datetime
from app.models.document_job import JobStage, JobStatus
from app.models.document_job_event import JobEventType

from pydantic import ConfigDict

class DocumentJobEventRead(BaseModel):
    id: int
    job_id: int
    stage: JobStage
    status: JobStatus
    event_type: JobEventType
    message: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentJobRead(BaseModel):
    id: int
    document_id: int
    stage: JobStage
    status: JobStatus
    error_message: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    duration_seconds: float | None = None
    created_at: datetime
    events: list[DocumentJobEventRead] = []
    
    model_config = ConfigDict(from_attributes=True)
