from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.document_job import DocumentJob
from app.models.enums import JobStage, JobStatus
from app.repositories.document_repository import DocumentRepository
from app.repositories.job_repository import JobRepository
from app.schemas.document import DocumentCreate
from app.services.file_storage_service import save_upload_file


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.document_repo = DocumentRepository(db)
        self.job_repo = JobRepository(db)

    def create_document_with_job(
        self,
        payload: DocumentCreate,
    ) -> tuple[Document, DocumentJob]:
        document = Document(
            title=payload.title,
            source_type=payload.source_type,
            raw_text=payload.raw_text,
            status=JobStatus.PENDING.value,
        )
        self.document_repo.create(document)

        job = DocumentJob(
            document_id=document.id,
            stage=JobStage.RECEIVED.value,
            status=JobStatus.PENDING.value,
        )
        self.job_repo.create(job)

        self.db.commit()
        self.db.refresh(document)
        self.db.refresh(job)

        return document, job

    def list_documents(self) -> list[Document]:
        return self.document_repo.list_all()

    def get_document(self, document_id: int) -> Document | None:
        return self.document_repo.get_by_id(document_id)
    
    def create_uploaded_document_with_job(
        self,
        title: str,
        file_name: str,
        file_path: str,
        content_type: str | None,
    ) -> tuple[Document, DocumentJob]:
        document = Document(
            title=title,
            source_type="file",
            file_name=file_name,
            file_path=file_path,
            content_type=content_type,
            status=JobStatus.PENDING.value,
        )

        self.document_repo.create(document)

        job = DocumentJob(
            document_id=document.id,
            stage=JobStage.RECEIVED.value,
            status=JobStatus.PENDING.value,
        )

        self.job_repo.create(job)

        self.db.commit()
        self.db.refresh(document)
        self.db.refresh(job)

        return document, job
    
    def reprocess_document(self, document_id: int) -> DocumentJob:
        document = self.get_document(document_id)
        if not document:
            raise ValueError(f"Document with id {document_id} not found")

        latest_jobs = self.job_repo.list_by_document_id(document_id)
        latest_job = latest_jobs[0] if latest_jobs else None

        if latest_job and latest_job.status in [
            JobStatus.PENDING.value,
            JobStatus.PROCESSING.value,
        ]:
            raise ValueError(
                f"Cannot reprocess document {document_id}: a job is already running"
            )
        
        job = DocumentJob(
            document_id=document.id,
            stage=JobStage.RECEIVED.value,
            status=JobStatus.PENDING.value,
        )
        self.job_repo.create(job)

        document.status = JobStatus.PENDING.value
        
        self.db.commit()
        self.db.refresh(job)
        
        return job
