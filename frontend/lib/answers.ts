
import { apiFetch } from "@/lib/api";

export type AnswerSource = {
  document_id: number;
  chunk_id: number;
  chunk_index: number;
  title: string | null;
  file_name: string | null;
  source_type: string;
  similarity_score: number | null;
  text: string;
};

export type AnswerStatus =
  | "answered"
  | "partial"
  | "insufficient_context";
  
export type AnswerResponse = {
  answer: string;
  status: AnswerStatus;
  sources: AnswerSource[];
};

export async function askQuestion(
  question: string,
  limit = 5
): Promise<AnswerResponse> {
  return apiFetch<AnswerResponse>("/api/v1/answers", {
    method: "POST",
    body: {
      question,
      limit,
    },
  });
}