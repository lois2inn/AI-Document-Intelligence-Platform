from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.document_job import JobStage, JobStatus


class JobEventType(str, Enum):
    STARTED = "STARTED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"



class DocumentJobEvent(Base):
    __tablename__ = "document_job_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    job_id: Mapped[int] = mapped_column(ForeignKey("document_jobs.id"), nullable=False)
    
    stage: Mapped[JobStage] = mapped_column(String(50), nullable=False)
    status: Mapped[JobStatus] = mapped_column(String(50), nullable=False)
    event_type: Mapped[JobEventType] = mapped_column(String(50), nullable=False)
    
    message: Mapped[str] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    job = relationship("DocumentJob", back_populates="events")
