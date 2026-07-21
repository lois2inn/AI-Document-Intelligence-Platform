import { Loader2 } from "lucide-react";

type ProcessingBannerProps = {
  documentStatus?: string | null;
  jobStage?: string | null;
  jobStatus?: string | null;
};

function formatStage(stage?: string | null): string {
  if (!stage) {
    return "Preparing";
  }

  const messages: Record<string, string> = {
    EXTRACTING: "Extracting document content",
    CLEANING: "Cleaning and normalizing text",
    CHUNKING: "Splitting the document into chunks",
    EMBEDDING: "Generating semantic embeddings",
    DONE: "Finalizing document processing",
  };

  return messages[stage.toUpperCase()] ?? "Processing document";
}

export default function ProcessingBanner({
  documentStatus,
  jobStage,
  jobStatus,
}: ProcessingBannerProps) {
  const normalizedDocumentStatus = documentStatus?.toUpperCase();
  const normalizedJobStatus = jobStatus?.toUpperCase();

  const isProcessing =
    normalizedDocumentStatus === "PENDING" ||
    normalizedDocumentStatus === "PROCESSING" ||
    normalizedJobStatus === "PENDING" ||
    normalizedJobStatus === "RUNNING";

  if (!isProcessing) {
    return null;
  }

  const message =
    normalizedJobStatus === "PENDING"
      ? "Your document is waiting to be processed."
      : `${formatStage(jobStage)}...`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-blue-200 bg-blue-50 p-4"
    >
      <div className="flex items-start gap-3">
        <Loader2
          aria-hidden="true"
          className="mt-1 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
        />

        <div>
          <p className="font-medium text-blue-900">
            Document processing
          </p>

          <p className="mt-1 text-sm text-blue-700">{message}</p>

          <p className="mt-1 text-xs text-blue-600">
            This page will update automatically.
          </p>
        </div>
      </div>
    </div>
  );
}