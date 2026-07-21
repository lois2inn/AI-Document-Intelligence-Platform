
from enum import Enum
from pydantic import BaseModel, Field

class AnswerRequest(BaseModel):
    question: str
    limit: int = 5

class AnswerSource(BaseModel):
    document_id: int
    chunk_id: int
    chunk_index: int
    title: str | None = None
    file_name: str | None = None
    source_type: str
    similarity_score: float | None = None
    text: str

class AnswerStatus(str, Enum):
    ANSWERED = "answered"
    PARTIAL = "partial"
    INSUFFICIENT_CONTEXT = "insufficient_context"

class AnswerResponse(BaseModel):
    answer: str
    sources: list[AnswerSource]
    status: AnswerStatus

class GeneratedAnswer(BaseModel):
    answer: str = Field(min_length=1)
    status: AnswerStatus
