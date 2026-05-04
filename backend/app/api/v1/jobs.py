from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.document_job import DocumentJob
from app.repositories.job_repository import JobRepository
from app.schemas.document_job import DocumentJobRead

router = APIRouter(prefix="/api/v1/jobs", tags=["jobs"])


@router.get("", response_model=list[DocumentJobRead])
def list_jobs(db: Session = Depends(get_db)) -> list[DocumentJob]:
    repo = JobRepository(db)
    return repo.list_all()


@router.get("/{job_id}", response_model=DocumentJobRead)
def get_job(job_id: int, db: Session = Depends(get_db)) -> DocumentJob:
    repo = JobRepository(db)
    job = repo.get_by_id(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return job