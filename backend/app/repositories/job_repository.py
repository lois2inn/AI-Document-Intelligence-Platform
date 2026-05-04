from sqlalchemy.orm import Session

from app.models.document_job import DocumentJob


class JobRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, job: DocumentJob) -> DocumentJob:
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