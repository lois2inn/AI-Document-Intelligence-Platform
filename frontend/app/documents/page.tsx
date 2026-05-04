// frontend/app/documents/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDocuments } from "@/lib/documents";
import type { Document } from "@/lib/types";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDocuments()
      .then(setDocuments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading documents...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Documents</h1>

        <Link
          href="/upload"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Upload Document
        </Link>
      </div>

      {documents.length === 0 ? (
        <p className="text-gray-500">No documents uploaded yet.</p>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="rounded-lg border p-4 shadow-sm transition hover:bg-gray-50"
            >
              <h2 className="text-xl font-semibold">{doc.title}</h2>
              <p className="text-sm text-gray-500">{doc.source_type}</p>
              <p className="mt-2">Status: {doc.status}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}