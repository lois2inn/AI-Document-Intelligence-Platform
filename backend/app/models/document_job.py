from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import JobStage, JobStatus

class DocumentJob(Base):
    __tablename__ = "document_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"), nullable=False)
    
    stage: Mapped[JobStage] = mapped_column(String(50), default=JobStage.RECEIVED.value)
    status: Mapped[JobStatus] = mapped_column(String(50), default=JobStatus.PENDING.value)
    
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)

    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="jobs")

    @property
    def duration_seconds(self) -> float | None:
        if not self.started_at:
            return None

        end_time = self.completed_at or datetime.now(timezone.utc)
        return (end_time - self.started_at).total_seconds()