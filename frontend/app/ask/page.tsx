
"use client";

import { useState } from "react";
import Link from "next/link";
import { askQuestion, type AnswerResponse } from "@/lib/answers";
import SourceCard from "@/components/ask/SourceCard";


function getDocumentDisplayName(source: {
  file_name: string | null;
  title: string | null;
  source_type: string;
  document_id: number;
}) {
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

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [limit, setLimit] = useState(5);
  const [response, setResponse] = useState<AnswerResponse | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const hasInsufficientContext =
    response?.status === "insufficient_context";

  async function handleAsk() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Please enter a question.");
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setHasSubmitted(true);

    try {
      const data = await askQuestion(trimmedQuestion, limit);
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Question answering failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Ask Your Knowledge Base</h1>

        <p className="mt-1 text-gray-600">
          Ask a question and get an AI-generated answer grounded in your
          documents.
        </p>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <textarea
          className="min-h-28 w-full rounded border px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          value={question}
          onChange={(event) => {
            setQuestion(event.target.value);

            if (error) {
              setError(null);
            }
          }}
          disabled={loading}
          placeholder="Example: What is object-oriented programming?"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm text-gray-600">
            Sources
            <input
              className="ml-2 w-24 rounded border px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100"
              type="number"
              min={1}
              max={10}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={loading}
            />
          </label>

          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="inline-flex items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading && (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              />
            )}
            {loading ? "Generating..." : "Ask AI"}
          </button>
        </div>

        {error && (<p role="alert" className="text-sm text-red-600">
            {error}
          </p>)}
      </section>

      <section className="min-h-40 space-y-3 rounded-lg border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium">AI Answer</h2>

          {loading && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 text-sm text-gray-500"
            >
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
              />

              Generating answer...
            </div>
          )}
        </div>

        {response ? (
          <div
            className={`transition-opacity ${
              loading ? "opacity-80" : "opacity-100"
            }`}
          >
            <p className="whitespace-pre-wrap leading-7 text-gray-800">
              {response.answer}
            </p>

            {loading && (
              <p className="mt-4 text-sm text-gray-500">
                Updating answer...
              </p>
            )}
          </div>
        ) : loading ? (
          <div className="flex min-h-24 items-center gap-3 text-gray-500">
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
            />

            <span>
              Searching your documents and generating a grounded answer...
            </span>
          </div>
        ) : (
          <div className="flex min-h-24 items-center rounded-md bg-gray-50 p-4 text-gray-500">
            {hasSubmitted
              ? "No answer is currently available."
              : "Ask a question to receive an answer grounded in your uploaded documents."}
          </div>
        )}
      </section>

      {response && (
        <section
          className={`space-y-3 transition-opacity ${
            loading ? "opacity-80" : "opacity-100"
          }`}
        >
          <h2 className="text-lg font-medium">
            {hasInsufficientContext
              ? `Closest Matching Passages (${response.sources.length})`
              : `Sources (${response.sources.length})`}
          </h2>

          {hasInsufficientContext && response.sources.length > 0 && (
            <p className="text-sm text-gray-600">
              These were the closest passages found, but they did not contain
              enough information to answer the question confidently.
            </p>
          )}

          <div className="space-y-4">
            {response.sources.map((source) => (
              <SourceCard key={source.chunk_id} source={source} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}