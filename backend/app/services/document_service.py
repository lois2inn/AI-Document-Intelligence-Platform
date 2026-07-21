from sqlalchemy.orm import Session

from app.models.document import Document, DocumentStatus
from app.models.document_job import DocumentJob
from app.models.document_job import JobStage, JobStatus
from app.repositories.document_repository import DocumentRepository
from app.repositories.job_repository import JobRepository
from app.schemas.document import DocumentCreate



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
            status=DocumentStatus.PENDING.value
        )
        self.document_repo.create(document)

        job = DocumentJob(
            document_id=document.id,
            stage=JobStage.EXTRACTING.value,
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
        try:

            document = Document(
                title=title,
                source_type="file",
                file_name=file_name,
                file_path=file_path,
                content_type=content_type,
                status=DocumentStatus.PENDING.value
            )

            self.document_repo.create(document)

            job = DocumentJob(
                document_id=document.id,
                stage=JobStage.EXTRACTING.value,
                status=JobStatus.PENDING.value,
            )

            self.job_repo.create(job)

            self.db.commit()
            self.db.refresh(document)
            self.db.refresh(job)

            return document, job
        except Exception:
            self.db.rollback()
            raise
    
    def reprocess_document(self, document_id: int) -> DocumentJob:
        document = self.get_document(document_id)
        if not document:
            raise ValueError(f"Document with id {document_id} not found")

        jobs = self.job_repo.list_by_document_id(document_id)
        latest_job = jobs[0] if jobs else None

        if latest_job and latest_job.status in [
            JobStatus.PENDING.value,
            JobStatus.RUNNING.value,
            "PROCESSING",
        ]:
            raise ValueError(
                f"Cannot reprocess document {document_id}: a job is already running"
            )
        
        job = self.job_repo.create_for_document(document.id)

        document.status = DocumentStatus.PENDING.value
        
        self.db.commit()
        self.db.refresh(job)
        
        return job
