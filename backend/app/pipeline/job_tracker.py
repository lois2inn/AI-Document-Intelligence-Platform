# app/pipeline/job_tracker.py

from sqlalchemy.orm import Session

from app.models.document_job import JobStage, JobStatus
from app.models.document_job_event import JobEventType
from app.repositories.job_repository import JobRepository


def mark_stage_started(
    db: Session,
    job_repo: JobRepository,
    job_id: int,
    stage: JobStage,
    message: str,
) -> None:
    job_repo.update_status(
        job_id=job_id,
        stage=stage,
        status=JobStatus.RUNNING,
    )

    job_repo.create_event(
        job_id=job_id,
        stage=stage,
        status=JobStatus.RUNNING,
        event_type=JobEventType.STARTED,
        message=message,
    )
    db.commit()


def mark_stage_completed(
    db: Session,
    job_repo: JobRepository,
    job_id: int,
    stage: JobStage,
    message: str,
) -> None:
    job_repo.create_event(
        job_id=job_id,
        stage=stage,
        status=JobStatus.COMPLETED,
        event_type=JobEventType.COMPLETED,
        message=message,
    )
    db.commit()



def mark_pipeline_failed(
    db: Session,
    job_repo: JobRepository,
    job_id: int,
    stage: JobStage,
    message: str,
    error_message: str | None = None,
) -> None:
    job_repo.update_status(
        job_id=job_id,
        stage=stage,
        status=JobStatus.FAILED,
        error_message=error_message or message,
    )

    job_repo.create_event(
        job_id=job_id,
        stage=stage,
        status=JobStatus.FAILED,
        event_type=JobEventType.FAILED,
        message=message,
    )
    db.commit()
