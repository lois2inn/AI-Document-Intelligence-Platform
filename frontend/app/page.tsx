"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { getDocuments } from "@/lib/documents";
import type { Document } from "@/lib/types";
import { DocumentStatus } from "@/lib/types";
import QuickActionCard from "@/components/QuickActionCard";
import RecentDocuments from "@/components/RecentDocuments";

export default function HomePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    getDocuments()
      .then(setDocuments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalDocuments = documents.length;

  const readyDocuments = documents.filter(
    (doc) => doc.status === DocumentStatus.COMPLETED
  ).length;

  const processingDocuments = documents.filter(
    (doc) => doc.status === DocumentStatus.PENDING || doc.status === DocumentStatus.PROCESSING
  ).length;

  const failedDocuments = documents.filter(
    (doc) => doc.status === DocumentStatus.FAILED
  ).length;
  
  return (
   <section>
      <div>
        <h1 className="text-4xl font-bold">
          <span className="text-indigo-600">AI</span> Document Intelligence Platform
        </h1>
        <p className="mt-2 font-semibold text-gray-700">
          Transform unstructured knowledge into AI-searchable intelligence.
        </p>
        <p className="mt-4 max-w-2xl text-gray-600">
          Upload documents and notes. Generate embeddings. <span className="text-indigo-600">Semantic Search</span>. Ask AI using Retrieval-Augmented Generation (
          <span className="text-indigo-600">RAG</span>
          ).
        </p>
      </div>

      {error && (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Documents"
          value={loading ? "..." : totalDocuments}
          description="Total uploaded documents"
        />

        <StatCard
          title="Ready"
          value={loading ? "..." : readyDocuments}
          description="Documents ready for AI search"
        />

        <StatCard
          title="Processing"
          value={loading ? "..." : processingDocuments}
          description="Documents currently processing"
        />

        <StatCard
          title="Failed"
          value={loading ? "..." : failedDocuments}
          description="Documents that need attention"
        />
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-900">Quick Actions</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <QuickActionCard
            title="Upload Documents"
            description="Add notes and documents to your knowledge base."
            href="/upload"
            actionLabel="Upload"
          />

          <QuickActionCard
            title="Semantic Search"
            description="Find relevant information using vector-based similarity search."
            href="/search"
            actionLabel="Search"
          />

          <QuickActionCard
            title="Ask AI"
            description="Ask natural-language questions over your processed knowledge base."
            href="/ask"
            actionLabel="Ask"
          />
        </div>
        
        <div className="mt-10">
          <RecentDocuments documents={documents} />
        </div>
      </div>
    </section>
  );
}