"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDocumentDetails } from "@/hooks/useDocumentDetails";
import { rerunDocumentPipeline, getEmbeddingSummary, type EmbeddingSummary } from "@/lib/documents";
import JobRunCard from "@/components/JobRunCard";
import { formatDateTime } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import ProcessingBanner from "@/components/ProcessingBanner";
import SuccessBanner from "@/components/feedback/SuccessBanner";


const FINAL_STATUSES = ["COMPLETED", "FAILED"];


export default function DocumentDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const pathname = usePathname();
  const router = useRouter();

  const uploadedSuccessfully = searchParams.get("uploaded") === "true";
  const [showUploadSuccess, setShowUploadSuccess] = useState(uploadedSuccessfully);

  const [showAllChunks, setShowAllChunks] = useState(false);
  const [rerunLoading, setRerunLoading] = useState(false);
  const [textView, setTextView] = useState<"raw" | "cleaned">("cleaned");
  const [rerunError, setRerunError] = useState<string | null>(null);
  const [embeddingSummary, setEmbeddingSummary] = useState<EmbeddingSummary | null>(null);

  const { document, jobs, chunks, loading, error, refetch } = useDocumentDetails(id);

  const targetChunkId = searchParams.get("chunk");

  const sortedJobs = useMemo(() => {
    return [...jobs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [jobs]);

  const [expandedJobIds, setExpandedJobIds] = useState<Record<number, boolean>>({});

  const latestJob = sortedJobs[0] ?? null;
  const previousJobs = sortedJobs.slice(1);

  useEffect(() => {
    if (!showUploadSuccess) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowUploadSuccess(false);
    }, 6000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showUploadSuccess]);

  useEffect(() => {
    if (!uploadedSuccessfully) {
      return;
    }

    setShowUploadSuccess(true);
    router.replace(pathname, { scroll: false });
  }, [uploadedSuccessfully, pathname, router]);

  useEffect(() => {
    if (!latestJob) return;

    setExpandedJobIds((prev) => {
      if (prev[latestJob.id] != null) return prev;
      return {
        ...prev,
        [latestJob.id]: true,
      };
    });
  }, [latestJob?.id]);

  useEffect(() => {
    if (!targetChunkId) return;
    setShowAllChunks(true);
  }, [targetChunkId]);

  useEffect(() => {
    if (!targetChunkId) return;
    if (!chunks.length) return;

    const el = window.document.getElementById(`chunk-${targetChunkId}`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [targetChunkId, chunks.length, showAllChunks]);

  const hasActiveJob = jobs.some(
    (job) => job.status === "PENDING" || job.status === "RUNNING"
  );

  useEffect(() => {
    if (!hasActiveJob) return;

    const interval = setInterval(() => {
      refetch();
    }, 2000);

    return () => clearInterval(interval);
  }, [hasActiveJob, refetch]);

  useEffect(() => {
    const documentId = Number(id);
    if (!id || Number.isNaN(documentId)) return;

    let cancelled = false;
    setEmbeddingSummary(null);

    getEmbeddingSummary(documentId)
      .then((summary) => {
        if (cancelled) return;
        setEmbeddingSummary(summary);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch embedding summary:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p className="p-6">Loading document...</p>;

  if (error) {
    return (
      <main className="p-6">
        <div className="mb-4">
          <Link href="/documents" className="text-blue-600 underline">
            Back to Documents
          </Link>
        </div>
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  if (!document) {
    return (
      <main className="p-6">
        <div className="mb-4">
          <Link href="/documents" className="text-blue-600 underline">
            Back to Documents
          </Link>
        </div>
        <p>Document not found.</p>
      </main>
    );
  }

  const isProcessing = !FINAL_STATUSES.includes(document.status);
  
  const documentStatus = document.status?.toUpperCase();
  const latestJobStatus = latestJob?.status?.toUpperCase();


  async function onRerun() {
    setRerunLoading(true);
    setRerunError(null);
    try {
      await rerunDocumentPipeline(id);
      await refetch();
      setRerunError(null);
    } catch (err) {
      setRerunError(err instanceof Error ? err.message : "Failed to reprocess");
    } finally {
      setRerunLoading(false);
    }
  }

  return (
    <main className="p-6">

      {showUploadSuccess && (
        <SuccessBanner
          title="Document uploaded successfully"
          message="The processing pipeline has started."
          onDismiss={() => setShowUploadSuccess(false)}
        />
      )}


      <section className="mb-6">
        <h1 className="text-2xl font-bold">{document.title}</h1>
        <p className="mt-1 text-sm text-gray-500">Document ID: {document.id}</p>
      </section>


      <section className="rounded-lg border p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
              <h2 className="text-lg font-semibold">
                Latest Status
              </h2>

              {latestJob?.completed_at && (
              <p className="mt-1 text-sm text-gray-500">
                Last processed:{" "}
                {formatDateTime(latestJob.completed_at)}
              </p>
              )}
          </div>

          <StatusBadge status={document.status} />
        </div>
      
        {isProcessing && (
        <div className="mt-4">
          <ProcessingBanner
            documentStatus={document.status}
            jobStage={latestJob?.stage}
            jobStatus={latestJob?.status}
          />
        </div>
       )}
  
        {!isProcessing && (
          <>
            <div className="mt-4">
            <button
              type="button"
              onClick={onRerun}
              disabled={rerunLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {rerunLoading ? "Starting pipeline..." : "Re-run pipeline"}
            </button>
            </div>
            {rerunError && <p className="mt-2 text-xs text-red-500">{rerunError}</p>}
          </>
        )}
      </section>

      {latestJob && (
        <JobRunCard
          key={latestJob.id}
          job={latestJob}
          expanded={expandedJobIds[latestJob.id] ?? true}
          onToggleExpanded={() =>
            setExpandedJobIds((prev) => ({
              ...prev,
              [latestJob.id]: !(prev[latestJob.id] ?? true),
            }))
          }
        />
      )}

      {previousJobs.map((job) => (
        <JobRunCard
          key={job.id}
          job={job}
          expanded={expandedJobIds[job.id] ?? false}
          onToggleExpanded={() =>
            setExpandedJobIds((prev) => ({
              ...prev,
              [job.id]: !(prev[job.id] ?? false),
            }))
          }
        />
      ))}

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-2">Document Info</h2>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Filename:</span>{" "}
            {document.file_name}
          </p>

          <p>
            <span className="font-medium">Created:</span>{" "}
            {new Date(document.created_at).toLocaleString()}
          </p>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-2">
          Chunk Preview ({document.chunk_count ?? chunks.length})
        </h2>

        {(showAllChunks ? chunks : chunks.slice(0, 3)).map((chunk) => (
          <div
            key={chunk.id}
            id={`chunk-${chunk.id}`}
            className="mb-4 rounded border-l-4 border-blue-400 pl-3"
          >
            <p className="text-xs text-gray-500">Chunk #{chunk.chunk_index}</p>
            <p className="text-sm">{chunk.content}</p>
          </div>
        ))}

        {chunks.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAllChunks((v) => !v)}
            className="text-sm text-blue-600 underline"
          >
            {showAllChunks ? "Show less" : "Show more"}
          </button>
        )}
      </section>

      <section className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Text Preview</h2>

          <div className="inline-flex rounded border overflow-hidden">
            <button
              type="button"
              onClick={() => setTextView("raw")}
              className={`px-3 py-1 text-sm ${
                textView === "raw" ? "bg-gray-900 text-white" : "bg-white text-gray-700"
              }`}
            >
              Raw
            </button>
            <button
              type="button"
              onClick={() => setTextView("cleaned")}
              className={`px-3 py-1 text-sm ${
                textView === "cleaned"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Cleaned
            </button>
          </div>
        </div>
        <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-sm">
          {(textView === "raw" ? document.raw_text : document.cleaned_text)?.slice(0, 500)}
        </p>
      </section>

      <section className="rounded-lg border p-4">
  <h2 className="text-lg font-semibold mb-4">
    Embeddings Status
  </h2>

  {!embeddingSummary ? (
    <p className="text-sm text-gray-500">
      Loading embedding summary...
    </p>
  ) : (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-[220px_1fr] gap-y-3 text-sm">
        <span className="font-medium">Status</span>
        <span
          className={`font-semibold ${
            embeddingSummary.status === "COMPLETED"
              ? "text-green-600"
              : embeddingSummary.status === "PARTIAL"
              ? "text-yellow-600"
              : "text-gray-500"
          }`}
        >
          {embeddingSummary.status}
        </span>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-y-3 text-sm">
        <span>Total Chunks</span>
        <span>{embeddingSummary.total_chunks}</span>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-y-3 text-sm">
        <span>Embedded Chunks</span>
        <div className="space-y-1">
          <span>
            {embeddingSummary.embedded_chunks} /{" "}
            {embeddingSummary.total_chunks}
          </span>

          <div className="max-w-xs w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{
                width: `${
                  (embeddingSummary.embedded_chunks /
                    embeddingSummary.total_chunks) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-[220px_1fr] gap-y-3 text-sm">
        <span>Embedding Model</span>
        <span>{embeddingSummary.embedding_model}</span>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-y-3 text-sm">
        <span>Vector Dimension</span>
        <span>
          {embeddingSummary.embedding_dimension}
        </span>
      </div>
    </div>
  )}
</section>
    </main>
  );
}
