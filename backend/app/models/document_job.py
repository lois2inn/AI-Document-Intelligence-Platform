from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class JobStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class JobStage(str, Enum):
    EXTRACTING = "EXTRACTING"
    CLEANING = "CLEANING"
    CHUNKING = "CHUNKING"
    EMBEDDING = "EMBEDDING"
    #INDEXING = "INDEXING"
    DONE = "DONE"

class DocumentJob(Base):
    __tablename__ = "document_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"), nullable=False)
    
    stage: Mapped[JobStage] = mapped_column(String(50), default=JobStage.EXTRACTING.value)
    status: Mapped[JobStatus] = mapped_column(String(50), default=JobStatus.PENDING.value)
    
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="jobs")
    events = relationship("DocumentJobEvent", back_populates="job", cascade="all, delete-orphan")

    @property
    def duration_seconds(self) -> float | None:
        if not self.started_at:
            return None

        end_time = self.completed_at or datetime.utcnow()
        return (end_time - self.started_at).total_seconds()