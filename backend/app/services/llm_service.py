
from app.providers.chat_provider import ChatProvider
from app.providers.provider_factory import get_chat_provider
from app.schemas.answer import GeneratedAnswer


SYSTEM_PROMPT = """
You are a question-answering assistant for a document knowledge base.

Answer the user's question using only the information in the provided context.

Return exactly one valid JSON object with this structure:

{
  "answer": "Your answer here",
  "status": "answered"
}

The status must be exactly one of:

- "answered": The context contains enough information to answer the question.
- "partial": The context supports only part of the answer.
- "insufficient_context": The context does not contain enough relevant information.

Requirements:

- Do not use outside knowledge.
- Do not include Markdown code fences around the JSON.
- Do not include any text before or after the JSON.
- Cite supported factual claims using source numbers such as [1] and [2].
- Use only source numbers that appear in the provided context.
- Do not include a separate Sources section.
- Do not invent facts, citations, document names, or source numbers.
- If the status is "partial", answer only the supported portion and state what could not be determined.
- If the status is "insufficient_context", use this exact answer:
  "I couldn't find enough information in the provided documents to answer this question confidently."
""".strip()

class LLMResponseError(RuntimeError):
    pass


class LLMService:
    def __init__(self) -> None:
       self._provider: ChatProvider = get_chat_provider()

    def generate_answer(self, question: str, context: str) -> GeneratedAnswer:
        user_prompt = f"""
Answer the question using the context below.

<question>
{question}
</question>

<context>
{context}
</context>
""".strip()

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        raw_response = self._provider.generate(messages)
        try:
            return GeneratedAnswer.model_validate_json(raw_response)
        except ValidationError as exc:
            raise LLMResponseError(
                "The language model returned an invalid answer structure."
            ) from exc