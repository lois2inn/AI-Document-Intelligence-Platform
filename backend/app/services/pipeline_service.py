import time
from datetime import datetime
from pathlib import Path

from app.db.session import SessionLocal
from app.models.document import Document
from app.models.document_job import DocumentJob
from app.models.document_chunk import DocumentChunk
from app.models.enums import JobStage, JobStatus
from app.services.chunking_service import chunk_text
from app.services.text_processing_service import clean_document_text


def process_document_job(document_id: int, job_id: int) -> None:
    db = SessionLocal()

    try:
        print(f"[TASK] Starting job_id={job_id}, document_id={document_id}")
        job = db.query(DocumentJob).filter(DocumentJob.id == job_id).first()
        document = db.query(Document).filter(Document.id == document_id).first()

        print(f"[TASK] Loaded job={job is not None}, document={document is not None}")

        if not job or not document:
            print("[TASK] Missing job or document")
            return

        # Mark as processing
        job.status = JobStatus.PROCESSING.value
        job.stage = JobStage.EXTRACTING.value
        job.started_at = datetime.utcnow()
        document.status = JobStatus.PROCESSING.value
        db.commit()

        print("[TASK] Moved to EXTRACTING")

        extracted_text = extract_text_from_document(document)

        # Move to cleaning stage
        job.stage = JobStage.CLEANING.value
        db.commit()

        print("[TASK] Moved to CLEANING")

        # Clean the text
        cleaned_text = clean_document_text(extracted_text)
        document.cleaned_text = cleaned_text
        db.commit()

        print("[TASK] Text cleaned")

        # Chunk the text
        job.stage = JobStage.CHUNKING.value
        db.commit()
        print("[TASK] Moved to CHUNKING")

        chunks = chunk_text(cleaned_text, chunk_size=300, overlap=50)

        for index, chunk in enumerate(chunks):
            db.add(
                DocumentChunk(
                    document_id=document.id,
                    chunk_index=index,
                    content=chunk,
                    char_count=len(chunk),
                )
            )

        db.commit()
        print(f"[TASK] Stored {len(chunks)} chunks")

        # Mark completed
        job.status = JobStatus.COMPLETED.value
        job.stage = JobStage.DONE.value
        job.completed_at = datetime.utcnow()

        document.status = JobStatus.COMPLETED.value
        db.commit()

        print("[TASK] Job completed successfully")
    except Exception as exc:
        db.rollback()
        print(f"[TASK] ERROR: {exc}")

        job = db.query(DocumentJob).filter(DocumentJob.id == job_id).first()
        document = db.query(Document).filter(Document.id == document_id).first()

        if job:
            job.status = JobStatus.FAILED.value
            job.error_message = str(exc)

        if document:
            document.status = JobStatus.FAILED.value

        db.commit()

    finally:
        db.close()
    
# For now, this supports .txt uploads well. PDF extraction can come next.
def extract_text_from_document(document: Document) -> str:
    if document.raw_text:
        return document.raw_text

    if document.file_path:
        path = Path(document.file_path)

        if not path.exists():
            raise FileNotFoundError(f"Uploaded file not found: {document.file_path}")

        if document.content_type and "text" in document.content_type:
            return path.read_text(encoding="utf-8")

        return f"File uploaded: {document.file_name}. Text extraction for this file type is not implemented yet."

    return ""