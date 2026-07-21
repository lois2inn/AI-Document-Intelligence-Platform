
from app.services.search_service import SearchService
from app.services.llm_service import LLMService
from app.schemas.answer import AnswerStatus, AnswerResponse

INSUFFICIENT_CONTEXT_MESSAGE = (
    "I couldn't find enough information in the provided documents "
    "to answer this question confidently."
)

class AnswerService:
    def __init__(self, db):
        self.search_service = SearchService(db)
        self.llm_service = LLMService()

    def answer_question(self, question: str, limit: int = 5) -> AnswerResponse:
        sources = self.search_service.semantic_search(
            query=question,
            limit=limit,
        )

        if not sources:
            return AnswerResponse(
                answer=INSUFFICIENT_CONTEXT_MESSAGE,
                status=AnswerStatus.INSUFFICIENT_CONTEXT,
                sources=[],
            )

        context_parts = []

        for i, source in enumerate(sources, start=1):
            label = source.get("file_name") or source.get("title") or f"Document {source['document_id']}"

            context_parts.append(
                f"""
Source [{i}]
Document: {label}
Chunk: {source["chunk_index"] + 1}
Text:
{source["text"]}
"""
            )

        context = "\n\n".join(context_parts)

        generated_answer = self.llm_service.generate_answer(
            question=question,
            context=context,
        )

        return AnswerResponse(
            answer=generated_answer.answer,
            status=generated_answer.status,
            sources=sources,
        )