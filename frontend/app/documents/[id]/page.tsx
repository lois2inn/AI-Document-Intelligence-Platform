"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useDocumentDetails } from "@/hooks/useDocumentDetails";
import JobPipelineStepper from "@/components/JobPipelineStepper";
import { rerunDocumentPipeline } from "@/lib/documents";


const FINAL_STATUSES = ["COMPLETED", "FAILED"];

export default function DocumentDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [showAllChunks, setShowAllChunks] = useState(false);
  const [rerunLoading, setRerunLoading] = useState(false);
  const [textView, setTextView] = useState<"raw" | "cleaned">("cleaned");
  const [rerunError, setRerunError] = useState<string | null>(null);

  const { document, jobs, chunks, loading, error, refetch } = useDocumentDetails(id);


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
      <div className="mb-4">
        <Link href="/documents" className="text-blue-600 underline">
          Back to Documents
        </Link>
      </div>

      <section>
        <h1 className="text-2xl font-bold">{document.title}</h1>
        <p className="text-sm text-gray-500">Document ID: {document.id}</p>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-2">Processing Status</h2>

        <p className="text-sm">
          Status:{" "}
          <span className="font-semibold">{document.status}</span>
        </p>

        <button
          type="button"
          onClick={onRerun}
          disabled={rerunLoading}
          className="mt-3 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {rerunLoading ? "Re-running..." : "Re-run pipeline"}
        </button>

        {rerunError && <p className="mt-2 text-xs text-red-500">{rerunError}</p>}
        </section>

        <JobPipelineStepper jobs={jobs} />

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
          <div key={chunk.id} className="mb-4 rounded border-l-4 border-blue-400 pl-3">
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
        <h2 className="text-lg font-semibold mb-2">Embeddings Status</h2>

        <p className="text-sm text-gray-600">
          Embeddings status
        </p>
      </section>
    </main>
  );
}
