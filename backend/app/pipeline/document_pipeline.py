
from datetime import datetime, timezone
from pathlib import Path

from app.db.session import SessionLocal
from app.models.document import Document
from app.models.document_job import DocumentJob
from app.models.document_job import JobStage, JobStatus
from app.models.document_job_event import JobEventType
from app.processors.text_processor import clean_document_text
from app.repositories.job_repository import JobRepository
from app.services.chunking_service import ChunkingService
from app.services.embedding_service import EmbeddingService
from app.services.text_extraction_service import TextExtractionService
from app.repositories.document_chunk_repository import DocumentChunkRepository
from app.models.document import DocumentStatus


from app.pipeline.job_tracker import (
    mark_stage_started,
    mark_stage_completed,
    mark_pipeline_failed,
)

def run_document_pipeline(document_id: int, job_id: int):
    db = SessionLocal()
    job_repo = JobRepository(db)
    chunk_repo = DocumentChunkRepository(db)
    chunking_service = ChunkingService()
    embedding_service = EmbeddingService()
    text_extraction_service = TextExtractionService()

    try:

        current_stage = JobStage.EXTRACTING
        print(
            f"[PIPELINE] Starting job_id={job_id}, "
            f"document_id={document_id}"
        )

        job = (
            db.query(DocumentJob)
            .filter(DocumentJob.id == job_id)
            .first()
        )

        document = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if not job:
            raise ValueError(f"Job {job_id} not found")

        if not document:
            raise ValueError(f"Document {document_id} not found")

        if job.document_id != document.id:
            raise ValueError(
                f"Job {job_id} does not belong to document {document_id}"
            )

        # Mark the new pipeline run as active.
        job.status = JobStatus.RUNNING
        job.stage = JobStage.EXTRACTING
        job.started_at = datetime.now(timezone.utc)
        job.completed_at = None

        document.status = DocumentStatus.PROCESSING
        db.commit()


        # -------------------------
        # EXTRACTING
        # -------------------------

        mark_stage_started(
            db=db,
            job_repo=job_repo,
            job_id=job_id,
            stage=current_stage,
            message="Extracting text started",
        )

        extracted_text = text_extraction_service.extract_text(document)

        if not extracted_text or not extracted_text.strip():
            raise ValueError("No text could be extracted from the document")

        mark_stage_completed(
            db=db,
            job_repo=job_repo,
            job_id=job_id,
            stage=current_stage,
            message="Extracting text completed",
        )

        # -------------------------
        # CLEANING
        # -------------------------
        current_stage = JobStage.CLEANING
        mark_stage_started(
            db=db,
            job_repo=job_repo,
            job_id=job_id,
            stage=current_stage,
            message="Cleaning text started",
        )

        cleaned_text = clean_document_text(extracted_text)
        if not cleaned_text or not cleaned_text.strip():
            raise ValueError("Document text was empty after cleaning")

        document.raw_text = extracted_text
        document.cleaned_text = cleaned_text
        db.commit()

        mark_stage_completed(
            db=db,
            job_repo=job_repo,
            job_id=job_id,
            stage=current_stage,
            message="Cleaning text completed",
        )

        # -------------------------
        # CHUNKING
        # -------------------------
        current_stage = JobStage.CHUNKING
        mark_stage_started(
            db=db,
            job_repo=job_repo,
            job_id=job_id,
            stage=current_stage,
            message="Chunking started",
        )

        chunks_data = chunking_service.create_chunks(cleaned_text)

        if not chunks_data:
            raise ValueError("Chunking produced no document chunks")

        chunk_repo.delete_by_document_id(document_id)

        created_chunks = chunk_repo.create_many(
            document_id=document_id,
            chunks=chunks_data,
        )

        db.commit()

        mark_stage_completed(
            db=db,
            job_repo=job_repo,
            job_id=job_id,
            stage=current_stage,
            message=f"Chunking completed: {len(created_chunks)} chunks created",
        )

        # -------------------------
        # EMBEDDING
        # -------------------------
        current_stage = JobStage.EMBEDDING
        mark_stage_started(
            db=db,
            job_repo=job_repo,
            job_id=job_id,
            stage=current_stage,
            message="Embedding generation started",
        )

        embeddings = embedding_service.generate_embeddings(
            [chunk.content for chunk in created_chunks]
        )

        if len(embeddings) != len(created_chunks):
            raise ValueError(
                "Embedding count does not match the number of created chunks"
            )
        
        for chunk, embedding in zip(created_chunks, embeddings):
            chunk.embedding = embedding

        db.commit()

        
        mark_stage_completed(
            db=db,
            job_repo=job_repo,
            job_id=job_id,
            stage=current_stage,
            message="Embedding completed",
        )

        # -------------------------
        # DONE
        # -------------------------
        current_stage = JobStage.DONE

        job_repo.update_status(
            job_id=job_id,
            stage=current_stage,
            status=JobStatus.COMPLETED,
        )
        
        job_repo.create_event(
            job_id=job_id,
            stage=current_stage,
            status=JobStatus.COMPLETED,
            event_type=JobEventType.COMPLETED,
            message="Pipeline completed successfully",
        )

        # Reloading is optional, but useful if repository methods expire
        # or update objects in the current session.
        job = (
            db.query(DocumentJob)
            .filter(DocumentJob.id == job_id)
            .first()
        )

        document = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if job:
            job.stage = JobStage.DONE
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.now(timezone.utc)

        if document:
            document.status = DocumentStatus.COMPLETED

        db.commit()

        print(
            f"[PIPELINE] Completed job_id={job_id}, "
            f"document_id={document_id}"
        )
        
    except Exception as exc:
        db.rollback()

        print(
            f"[PIPELINE] Failed job_id={job_id}, "
            f"document_id={document_id}, "
            f"stage={current_stage}, error={exc!r}"
        )

        user_message = friendly_pipeline_error(exc)


        try:
            # Preserve the actual stage that failed. Do not replace it
            # with JobStage.FAILED.
            mark_pipeline_failed(
                db=db,
                job_repo=job_repo,
                job_id=job_id,
                stage=current_stage,
                message=user_message,
                error_message=repr(exc)[:2000],
            )

            job = (
                db.query(DocumentJob)
                .filter(DocumentJob.id == job_id)
                .first()
            )

            document = (
                db.query(Document)
                .filter(Document.id == document_id)
                .first()
            )

            if job:
                job.status = JobStatus.FAILED
                job.stage = current_stage
                job.completed_at = datetime.now(timezone.utc)

                # Keep this only if DocumentJob has error_message.
                if hasattr(job, "error_message"):
                    job.error_message = str(exc)[:2000]

            if document:
                document.status = DocumentStatus.FAILED

            db.commit()

        except Exception as tracking_exc:
            db.rollback()
            print(
                "[PIPELINE] Failed while recording pipeline failure: "
                f"{tracking_exc!r}"
            )

    finally:
        db.close()




def friendly_pipeline_error(exc: Exception) -> str:
    exc_type = type(exc).__name__
    message = str(exc) or ""

    if isinstance(exc, FileNotFoundError):
        return "Uploaded file could not be found on the server."

    # SQLAlchemy integrity errors (if you use SQLAlchemy)
    try:
        from sqlalchemy.exc import IntegrityError
        if isinstance(exc, IntegrityError):
            orig = getattr(exc, "orig", None)
            sqlstate = getattr(orig, "sqlstate", None) or getattr(
                getattr(orig, "diag", None), "sqlstate", None
            )
            orig_msg = str(orig) if orig else message

            if sqlstate == "23502":
                return "Chunking failed because required chunk metadata was missing."
            if sqlstate == "23505":
                return "A record already exists with the same unique value."
            if sqlstate == "23503":
                return "This item cannot be saved because it references a missing related record."
            if sqlstate == "22001":
                return "One of the fields is too long to store."
            if sqlstate == "22P02":
                return "Invalid value format was provided."
            
            return "Database constraint error while saving pipeline results."
    except Exception:
        pass

    return "Pipeline failed due to an unexpected error."