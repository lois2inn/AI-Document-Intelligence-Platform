// frontend/lib/documents.ts

import { apiFetch } from "./api";
import type {
  Document,
  DocumentCreateResponse,
  DocumentJob,
} from "./types";

export function getDocuments() {
  return apiFetch<Document[]>("/api/v1/documents");
}

export function getDocumentById(id: string) {
  return apiFetch<Document>(`/api/v1/documents/${id}`);
}

export async function getDocumentJobs(
  documentId: string
): Promise<DocumentJob[]> {
  return apiFetch<DocumentJob[]>(
    `/api/v1/documents/${documentId}/jobs`
  );
}

export async function getDocumentChunks(
  documentId: string
): Promise<any[]> {
  return apiFetch<any[]>(
    `/api/v1/documents/${documentId}/chunks`
  );
}

export async function uploadDocument(
  title: string,
  file: File
): Promise<DocumentCreateResponse> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);

  return apiFetch<DocumentCreateResponse>(
    "/api/v1/documents/upload",
    {
      method: "POST",
      body: formData,
      isFormData: true,
    }
  );
}

export async function rerunDocumentPipeline(
  documentId: string
): Promise<DocumentCreateResponse> {
  return apiFetch<DocumentCreateResponse>(
    `/api/v1/documents/${documentId}/reprocess`,
    {
      method: "POST",
    }
  );
}

export interface EmbeddingSummary {
  document_id: number;
  total_chunks: number;
  embedded_chunks: number;
  embedding_model: string;
  embedding_dimension: number;
  status: "NOT_STARTED" | "PARTIAL" | "COMPLETED";
}

export async function getEmbeddingSummary(
  documentId: number
): Promise<EmbeddingSummary> {
  return apiFetch<EmbeddingSummary>(
    `/api/v1/documents/${documentId}/embedding-summary`
  );
}