import Link from "next/link";
import type { AnswerResponse } from "@/lib/answers";

type AnswerSource = AnswerResponse["sources"][number];

type SourceCardProps = {
  source: AnswerSource;
};

function getDocumentDisplayName(source: AnswerSource) {
  if (source.file_name) return source.file_name;
  if (source.title) return source.title;
  return `${source.source_type} #${source.document_id}`;
}

function getSourceIcon(sourceType: string) {
  if (sourceType === "FILE") return "📄";
  if (sourceType === "NOTE") return "📝";
  if (sourceType === "URL") return "🔗";
  return "📘";
}

function truncateText(text: string, maxLength = 250) {
  const normalizedText = text.trim();

  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, maxLength).trimEnd()}…`;
}

export default function SourceCard({ source }: SourceCardProps) {
  const similarityPercentage =
    source.similarity_score !== null
      ? Math.round(source.similarity_score * 100)
      : null;

  return (
    <article className="rounded-lg border p-4 transition hover:border-gray-400 hover:shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-gray-900">
            <span aria-hidden="true">
              {getSourceIcon(source.source_type)}{" "}
            </span>
            {getDocumentDisplayName(source)}
          </h3>

          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-1 text-xs">Chunk #{source.chunk_index + 1}</span>

            {similarityPercentage !== null && (
              <span className="rounded bg-gray-100 px-2 py-1 text-xs">Similarity: {similarityPercentage}%</span>
            )}
          </div>
        </div>

        <Link
          href={`/documents/${source.document_id}`}
          className="shrink-0 text-sm font-medium text-gray-700 underline-offset-4 hover:underline"
        >
          Open document →
        </Link>
      </div>

      <div className="my-4 border-t" />

      <p className="whitespace-pre-wrap leading-7 text-gray-700">
        {truncateText(source.text)}
      </p>
    </article>
  );
}