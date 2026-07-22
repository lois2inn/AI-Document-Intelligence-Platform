
export type JobStage = "EXTRACTING" | "CLEANING" | "CHUNKING" | "EMBEDDING" | "DONE";

export enum DocumentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum JobStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export type Status = DocumentStatus | JobStatus;

export type Document = {
  id: number;
  title: string;
  source_type: string;

  raw_text: string | null;
  cleaned_text: string | null;

  file_name: string | null;
  file_path: string | null;
  content_type: string | null;

  status: DocumentStatus;
  created_at: string;
  chunk_count?: number | null;
};

export type DocumentJob = {
  id: number;
  document_id: number;
  stage: JobStage;
  status: JobStatus;
  error_message?: string | null;
  created_at: string;
  updated_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  duration_seconds?: number | null;
  events: DocumentJobEvent[];
};

export type DocumentJobEvent = {
  id: number;
  job_id: number;
  stage: JobStage;
  status: JobStatus;
  event_type: "STARTED" | "COMPLETED" | "FAILED";
  message?: string | null;
  created_at: string;
};

export type DocumentCreateResponse = {
  document: Document;
  job: DocumentJob;
};