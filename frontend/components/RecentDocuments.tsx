import Link from "next/link";
import type { Document } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

type RecentDocumentsProps = {
  documents: Document[];
};

export default function RecentDocuments({ documents }: RecentDocumentsProps) {
  const recentDocuments = [...documents]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  if (recentDocuments.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Documents
        </h2>
      </div>

      <div className="divide-y">
        {recentDocuments.map((doc) => (
          <Link
            key={doc.id}
            href={`/documents/${doc.id}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
          >
            <div>
              <p className="font-medium text-gray-900">{doc.title}</p>
              <p className="text-sm text-gray-500">{doc.source_type}</p>
            </div>

            <StatusBadge status={doc.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}