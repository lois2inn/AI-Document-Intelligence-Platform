
import { apiFetch } from "@/lib/api";

export type SemanticSearchResult = {
  document_id: number;
  chunk_id: number;
  chunk_index: number;
  text: string;
  title: string | null;
  file_name: string | null;
  source_type: string;
  similarity_score: number | null;
};

export async function semanticSearch(query: string, limit = 5) {
  return apiFetch<SemanticSearchResult[]>("/api/v1/search/semantic", {
    method: "POST",
    body: { query, limit },
  });
}