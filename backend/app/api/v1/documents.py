from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.document import Document
from app.models.document_job import DocumentJob
from app.models.document_chunk import DocumentChunk
from app.schemas.document import DocumentCreate, DocumentRead, DocumentCreateResponse, DocumentJobRead
from app.schemas.document_chunk import DocumentChunkRead
from app.services.pipeline_service import process_document_job
from app.services.document_service import DocumentService
from app.repositories.chunk_repository import ChunkRepository
from app.repositories.job_repository import JobRepository
from app.models.enums import JobStage, JobStatus

from fastapi import File, Form, UploadFile
from app.services.file_storage_service import save_upload_file

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

    background_tasks.add_task(process_document_job, document.id, job.id)

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

    chunk_repo = ChunkRepository(db)
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

    chunk_repo = ChunkRepository(db)
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


@router.post("/{document_id}/rerun", response_model=DocumentCreateResponse)
def rerun_document_pipeline(
    document_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    service = DocumentService(db)
    try:
        job = service.reprocess_document(document_id)
    except ValueError as exc:
        message = str(exc)
        if "not found" in message.lower():
            raise HTTPException(status_code=404, detail=message)
        if "already running" in message.lower():
            raise HTTPException(status_code=409, detail=message)
        raise HTTPException(status_code=400, detail=message)

    background_tasks.add_task(process_document_job, job.document_id, job.id)

    return {
        "document": job.document,
        "job": job,
    }

@router.post("/upload", response_model=DocumentCreateResponse)
def upload_document(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    original_name, file_path = save_upload_file(file)

    service = DocumentService(db)
    document, job = service.create_uploaded_document_with_job(
        title=title,
        file_name=original_name,
        file_path=file_path,
        content_type=file.content_type,
    )

    background_tasks.add_task(process_document_job, document.id, job.id)

    return {
        "document": document,
        "job": job,
    }