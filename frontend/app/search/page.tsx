
"use client";

import { useState } from "react";
import Link from "next/link";
import { semanticSearch, SemanticSearchResult } from "@/lib/search";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter a search query.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await semanticSearch(trimmedQuery, limit);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }
  console.table(results);

  function getDocumentDisplayName(result: SemanticSearchResult) {
    if (result.file_name) return result.file_name;
    if (result.title) return result.title;
    return `${result.source_type} #${result.document_id}`;
  }

  function getSourceIcon(sourceType: string) {
    if (sourceType === "file") return "📄";
    if (sourceType === "note") return "📝";
    if (sourceType === "url") return "🔗";
    return "📘";
  }

  function TruncatedText({ text, maxLength }: { text: string; maxLength: number }) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= maxLength) {
    return <p className="text-gray-800 whitespace-pre-wrap">{text}</p>;
  }

  return (
    <div>
      <p className="text-gray-800 whitespace-pre-wrap">
        {expanded ? text : `${text.slice(0, maxLength)}...`}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-blue-600 text-sm mt-1 hover:underline"
      >
        {expanded ? "Show Less" : "Show More"}
      </button>
    </div>
  );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Semantic Search</h1>
        <p className="text-gray-600 mt-1">
          Search your document chunks by meaning, not just exact keywords.
        </p>
      </section>

      <section className="border rounded-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            className="border rounded px-3 py-2 flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask something about your documents..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <input
            className="border rounded px-3 py-2 w-24"
            type="number"
            min={1}
            max={20}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </section>

      <section className="space-y-3">
        {results.length > 0 && (
          <h2 className="text-lg font-medium">
            {results.length} {results.length === 1 ? "result" : "results"}
          </h2>
        )}

        {!loading && results.length === 0 && (
          <div className="text-gray-500 space-y-2">
            <p>No matching content found.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Try different wording</li>
              <li>Use broader concepts</li>
              <li>Use fewer words</li>
            </ul>
          </div>
        )}

        {results.map((result) => (
          <Link
            key={result.chunk_id}
            href={`/documents/${result.document_id}?chunk=${result.chunk_id}`}
            className="block border rounded-lg p-4 space-y-2 hover:bg-gray-50"
          >
            {result.text.length > 100 ? (
              <TruncatedText text={result.text} maxLength={100} />
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap">{result.text}</p>
            )}

            <div className="text-sm text-gray-500 flex flex-wrap gap-3">
              <span>
                {getSourceIcon(result.source_type)} {getDocumentDisplayName(result)}
              </span>
              <span>Chunk {result.chunk_index + 1}</span>
             
                  {(() => {
                  const score = result.similarity_score ?? 0;
                  const pct = Math.round(score * 100);

                  const badgeClass =
                    pct >= 85
                      ? "bg-green-50 text-green-700 border-green-200"
                      : pct >= 70
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-gray-50 text-gray-700 border-gray-200";

                  return (
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClass}`}
                      title={`Similarity score: ${score.toFixed(3)}`}
                    >
                      Similarity {pct}%
                    </span>
                  );
                })()}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
