
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">AI Knowledge Tracker</h1>

      <div className="mt-4 space-x-4">
        <Link
          href="/documents"
          className="rounded bg-black px-4 py-2 text-white"
        >
          View Documents
        </Link>

        <Link
          href="/upload"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Upload
        </Link>
      </div>
    </main>
  );
}