"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/lib/documents";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Please choose a file.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await uploadDocument(title, file);

      router.push("/documents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6">
      <h1 className="mb-4 text-3xl font-bold">Upload Document</h1>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="mb-1 block font-medium">Title</label>
          <input
            className="w-full rounded border p-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Sample document"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">File</label>
          <input
            type="file"
            className="w-full rounded border p-2"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </main>
  );

}
