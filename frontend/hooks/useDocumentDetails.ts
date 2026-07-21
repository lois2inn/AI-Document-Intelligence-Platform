import { useCallback, useEffect, useState } from "react";
import { getDocumentById, getDocumentJobs, getDocumentChunks } from "@/lib/documents";
import type { Document, DocumentJob } from "@/lib/types";

const FINAL_STATUSES = ["COMPLETED", "FAILED"];
const ACTIVE_JOB_STATUSES = ["PENDING", "RUNNING", "PROCESSING"];

export function useDocumentDetails(id: string) {
  const [document, setDocument] = useState<Document | null>(null);
  const [jobs, setJobs] = useState<DocumentJob[]>([]);
  const [chunks, setChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
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
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch document",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);


  const hasActiveJob = jobs.some((job) =>
    ACTIVE_JOB_STATUSES.includes(job.status),
  );

  const isProcessing =
    !document ||
    !FINAL_STATUSES.includes(document.status) ||
    hasActiveJob;

  useEffect(() => {
    if (!id) {
      return;
    }

    void fetchDetails();
  }, [id, fetchDetails]);

  useEffect(() => {
    if (!id || !isProcessing) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void fetchDetails();
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [id, isProcessing, fetchDetails]);

  return {
    document,
    jobs,
    chunks,
    loading,
    error,
    refetch: fetchDetails,
    isProcessing,
  };
}