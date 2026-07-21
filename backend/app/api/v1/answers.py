# app/api/v1/answers.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.answer import AnswerRequest, AnswerResponse
from app.services.answer_service import AnswerService

router = APIRouter(prefix="/api/v1/answers", tags=["answers"])

@router.post("/", response_model=AnswerResponse)
def answer_question(
    request: AnswerRequest,
    db: Session = Depends(get_db),
):
    service = AnswerService(db)

    return service.answer_question(
        question=request.question,
        limit=request.limit,
    )