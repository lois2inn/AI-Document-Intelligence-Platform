// components/JobRunCard.tsx

import { DocumentJob } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { JobTimeline } from "./JobTimeline";
import JobPipelineStepper from "./JobPipelineStepper";
import StatusBadge from "./StatusBadge";

interface JobRunCardProps {
  job: DocumentJob;
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

export default function JobRunCard({
  job,
  expanded = false,
  onToggleExpanded,
}: JobRunCardProps) {
  const durationText =
    job.duration_seconds != null ? `${job.duration_seconds.toFixed(2)}s` : "";

  const toggleGlyph = expanded ? "▼" : "▶";

  return (
    <section className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        {onToggleExpanded ? (
          <button
            type="button"
            onClick={onToggleExpanded}
            className="min-w-0 text-left"
          >
            <h2 className="text-lg font-semibold truncate">
              {toggleGlyph} Run #{job.id}
            </h2>

            {!expanded && (
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                <StatusBadge status={job.status} />
                {durationText && (
                  <span className="text-gray-600">— {durationText}</span>
                )}
              </div>
            )}
          </button>
        ) : (
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">Run #{job.id}</h2>
          </div>
        )}

        <span className="text-sm text-gray-500">
          {formatDateTime(job.created_at)}
        </span>
      </div>

      {expanded && (
        <>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <StatusBadge status={job.status} />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Duration:</span>
              <span>{durationText}</span>
            </div>

            <p>
              <span className="font-medium">Current Stage:</span> {job.stage}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <JobPipelineStepper jobs={[job]} />

            <JobTimeline events={job.events} />
          </div>
        </>
      )}
    </section>
  );
}