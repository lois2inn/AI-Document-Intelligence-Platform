from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.document_job import DocumentJob
from app.models.document_job_event import DocumentJobEvent
from app.models.document_job import JobStage, JobStatus
from app.models.document_job_event import JobEventType


class JobRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, job: DocumentJob) -> DocumentJob:
        self.db.add(job)
        self.db.flush()
        return job

    def create_for_document(self, document_id: int) -> DocumentJob:
        job = DocumentJob(
            document_id=document_id,
            stage=JobStage.EXTRACTING.value,
            status=JobStatus.PENDING.value,
        )

        self.db.add(job)
        self.db.flush()

        return job

    def list_all(self) -> list[DocumentJob]:
        return (
            self.db.query(DocumentJob)
            .order_by(DocumentJob.created_at.desc())
            .all()
        )

    def get_by_id(self, job_id: int) -> DocumentJob | None:
        return (
            self.db.query(DocumentJob)
            .filter(DocumentJob.id == job_id)
            .first()
        )
    
    def list_by_document_id(self, document_id: int) -> list[DocumentJob]:
        return (
            self.db.query(DocumentJob)
            .filter(DocumentJob.document_id == document_id)
            .order_by(DocumentJob.created_at.desc())
            .all()
        )
    
    def update_status(self, job_id: int, status: JobStatus, stage: JobStage | None = None, error_message: str | None = None) -> DocumentJob:
        job = self.get_by_id(job_id)

        if not job:
            raise ValueError(f"Job with id {job_id} not found")

        if stage is not None:
            job.stage = stage

        job.status = status
        job.error_message = error_message

        now = datetime.now(timezone.utc)

        if status == JobStatus.RUNNING and job.started_at is None:
            job.started_at = now

        if status in [JobStatus.COMPLETED, JobStatus.FAILED]:
            job.completed_at = now

        self.db.flush()
        return job
    
    def create_event(self, job_id: int, stage: JobStage, status: JobStatus, event_type: JobEventType, message: str | None = None) -> DocumentJobEvent:
        event = DocumentJobEvent(
            job_id=job_id,
            stage=stage,
            status=status,
            event_type=event_type,
            message=message,
        )
        self.db.add(event)
        self.db.flush()
        return event