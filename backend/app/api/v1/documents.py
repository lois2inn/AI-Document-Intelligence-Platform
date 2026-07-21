from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.document import Document
from app.models.document_job import DocumentJob
from app.models.document_chunk import DocumentChunk
from app.models.document_job import JobStage, JobStatus
from app.pipeline.document_pipeline import run_document_pipeline
from app.repositories.document_chunk_repository import DocumentChunkRepository
from app.repositories.job_repository import JobRepository
from app.schemas.document import DocumentCreate, DocumentRead, DocumentCreateResponse, DocumentJobRead
from app.schemas.document_chunk import DocumentChunkRead
from app.services.document_service import DocumentService
from app.storage.file_storage import FileStorageService
from app.validators.upload_validator import validate_upload_file, UnsupportedUploadTypeError

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


@router.get("", response_model=list[DocumentRead])
def list_documents(db: Session = Depends(get_db)) -> list[Document]:
    service = DocumentService(db)
    return service.list_documents()

@router.post("", response_model=DocumentCreateResponse)
def create_document(
    payload: DocumentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    document, job = service.create_document_with_job(payload)

    background_tasks.add_task(run_document_pipeline, document.id, job.id)

    return {
        "document": document,
        "job": job,
    }

@router.post("/upload", response_model=DocumentCreateResponse, status_code=status.HTTP_201_CREATED,)
def upload_document(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        validate_upload_file(file)
    except UnsupportedUploadTypeError as exc:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=str(exc),
        ) from exc

    file_storage = FileStorageService()
    original_name, file_path = file_storage.save_upload_file(file)

    try:
        service = DocumentService(db)
        document, job = service.create_uploaded_document_with_job(
            title=title.strip(),
            file_name=original_name,
            file_path=file_path,
            content_type=file.content_type,
        )
    except Exception:
        file_storage.delete_file(file_path)
        raise

    background_tasks.add_task(run_document_pipeline, document.id, job.id)

    return {
        "document": document,
        "job": job,
    }
    
@router.get("/{document_id}", response_model=DocumentRead)
def get_document(document_id: int, db: Session = Depends(get_db)) -> Document:
    service = DocumentService(db)
    document = service.get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    chunk_repo = DocumentChunkRepository(db)
    document.chunk_count = chunk_repo.count_by_document_id(document_id)

    return document


@router.get("/{document_id}/chunks", response_model=list[DocumentChunkRead])
def get_document_chunks(
    document_id: int,
    db: Session = Depends(get_db),
) -> list[DocumentChunk]:
    service = DocumentService(db)
    document = service.get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    chunk_repo = DocumentChunkRepository(db)
    return chunk_repo.list_by_document_id(document_id)

@router.get("/{document_id}/jobs", response_model=list[DocumentJobRead])
def get_document_jobs(
    document_id: int,
    db: Session = Depends(get_db),
) -> list[DocumentJob]:
    service = DocumentService(db)
    document = service.get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    job_repo = JobRepository(db)
    return job_repo.list_by_document_id(document_id)

@router.post("/{document_id}/reprocess")
def reprocess_document(
    document_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    service = DocumentService(db)

    try:
        job = service.reprocess_document(document_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    background_tasks.add_task(run_document_pipeline, document_id, job.id)

    return {
        "message": "Reprocess started",
        "document_id": document_id,
        "job_id": job.id,
        "stage": job.stage,
        "status": job.status,
    }


@router.get("/{document_id}/embedding-summary")
def get_document_embedding_summary(
    document_id: int,
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    document = service.get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .all()
    )

    total_chunks = len(chunks)
    embedded_chunks = sum(1 for chunk in chunks if chunk.embedding is not None)

    return {
        "document_id": document_id,
        "total_chunks": total_chunks,
        "embedded_chunks": embedded_chunks,
        "embedding_model": "text-embedding-3-small",
        "embedding_dimension": 1536,
        "status": (
            "NOT_STARTED"
            if total_chunks == 0
            else "COMPLETED"
            if embedded_chunks == total_chunks
            else "PARTIAL"
        ),
    }