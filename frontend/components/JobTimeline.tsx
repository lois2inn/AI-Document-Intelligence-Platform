// components/JobTimeline.tsx

import { formatDateTime } from "@/lib/format";
import { DocumentJobEvent } from "@/lib/types";

export function JobTimeline({ events }: { events: DocumentJobEvent[] }) {
  const sorted = sortEvents(events);

  return (
    <div className="leading-6">
      {sorted.map((event) => (
        <div key={event.id} className="flex gap-2">
          <span className="text-gray-500">
            {formatDateTime(event.created_at)}
          </span>

          <span>
            {event.event_type === "STARTED"
              ? "▶"
              : event.event_type === "COMPLETED"
              ? "✔"
              : event.event_type === "FAILED"
              ? "✖"
              : "•"}{" "}
            {event.stage} {event.event_type.toLowerCase()}
          </span>

          {event.event_type === "FAILED" && event.message && (
            <span className="text-red-500">({event.message})</span>
          )}
        </div>
      ))}
    </div>
  );
}

function sortEvents(events: DocumentJobEvent[]) {
  return [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}