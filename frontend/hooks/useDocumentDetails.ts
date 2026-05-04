import { useEffect, useState } from "react";
import { getDocumentById, getDocumentJobs, getDocumentChunks } from "@/lib/documents";
import type { Document, DocumentJob } from "@/lib/types";

const FINAL_STATUSES = ["COMPLETED", "FAILED"];
const ACTIVE_JOB_STATUSES = ["PENDING", "PROCESSING"];

export function useDocumentDetails(id: string) {
  const [document, setDocument] = useState<Document | null>(null);
  const [jobs, setJobs] = useState<DocumentJob[]>([]);
  const [chunks, setChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDetails() {
    try {
      const [docData, jobData, chunksData] = await Promise.all([
        getDocumentById(id),
        getDocumentJobs(id),
        getDocumentChunks(id),
      ]);

      setDocument(docData);
      setJobs(jobData);
      setChunks(chunksData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch document");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    fetchDetails();

    const intervalId = setInterval(() => {
      const hasActiveJob = jobs.some((j) => ACTIVE_JOB_STATUSES.includes(j.status));

      if (document && FINAL_STATUSES.includes(document.status) && !hasActiveJob) {
        clearInterval(intervalId);
        return;
      }

      fetchDetails();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [id, document?.status, jobs]);

  return {
    document,
    jobs,
    chunks,
    loading,
    error,
    refetch: fetchDetails,
  };
}