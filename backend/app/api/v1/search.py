
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.search import SemanticSearchRequest
from app.services.search_service import SearchService

router = APIRouter(prefix="/api/v1/search", tags=["search"])

@router.post("/semantic")
def semantic_search(
    request: SemanticSearchRequest,
    db: Session = Depends(get_db),
):
    service = SearchService(db)

    return service.semantic_search(
        query=request.query,
        limit=request.limit,
    )