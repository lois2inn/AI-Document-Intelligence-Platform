import type { DocumentJob } from "@/lib/types";

const PIPELINE_STAGES = ["EXTRACTING", "CLEANING", "CHUNKING", "DONE"];

type Props = {
  jobs: DocumentJob[];
};


export default function JobPipelineStepper({ jobs }: Props) {
  const toTs = (iso: string | null | undefined) =>
    iso ? new Date(iso).getTime() : -Infinity;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const timelineEvents = jobs
    .flatMap((job) => {
      const events: { ts: number; label: string }[] = [];

      if (job.started_at) {
        events.push({
          ts: toTs(job.started_at),
          label: `[${formatTime(job.started_at)}] ${job.stage} started`,
        });
      }

      if (job.completed_at && (job.status === "COMPLETED" || job.status === "FAILED")) {
        events.push({
          ts: toTs(job.completed_at),
          label: `[${formatTime(job.completed_at)}] ${job.stage} ${job.status.toLowerCase()}`,
        });
      }

      return events;
    })
    .filter((e) => e.ts !== -Infinity)
    .sort((a, b) => a.ts - b.ts);

  const getStageDurationSeconds = (stage: string): number | null => {
    const completedForStage = jobs.filter(
      (j) => j.stage === stage && j.status === "COMPLETED" && j.duration_seconds != null
    );
    if (completedForStage.length === 0) return null;

    const latest = completedForStage.reduce((best, j) => {
      const bestTs = Math.max(
        toTs(best.completed_at),
        toTs(best.started_at),
        toTs(best.created_at)
      );
      const jTs = Math.max(toTs(j.completed_at), toTs(j.started_at), toTs(j.created_at));
      return jTs > bestTs ? j : best;
    }, completedForStage[0]);

    return latest.duration_seconds ?? null;
  };

  const getStageErrorMessage = (stage: string): string | null => {
    const failedForStage = jobs.filter(
      (j) => j.stage === stage && j.status === "FAILED" && j.error_message
    );
    if (failedForStage.length === 0) return null;

    const latest = failedForStage.reduce((best, j) => {
      const bestTs = Math.max(
        toTs(best.completed_at),
        toTs(best.started_at),
        toTs(best.created_at)
      );
      const jTs = Math.max(toTs(j.completed_at), toTs(j.started_at), toTs(j.created_at));
      return jTs > bestTs ? j : best;
    }, failedForStage[0]);

    return latest.error_message;
  };

  const selectCurrentJob = (allJobs: DocumentJob[]): DocumentJob | undefined => {
    const running = allJobs.find((j) => j.status === "RUNNING");
    if (running) return running;

    const terminal = allJobs.filter(
      (j) => j.status === "FAILED" || j.status === "COMPLETED"
    );
    if (terminal.length === 0) return undefined;

    return terminal.reduce((latest, j) => {
      const latestTs = Math.max(
        toTs(latest.completed_at),
        toTs(latest.started_at),
        toTs(latest.created_at)
      );
      const jTs = Math.max(toTs(j.completed_at), toTs(j.started_at), toTs(j.created_at));
      return jTs > latestTs ? j : latest;
    }, terminal[0]);
  };

  const currentJob = selectCurrentJob(jobs);

  function getStageStatus(
    stage: string
  ): "COMPLETED" | "FAILED" | "RUNNING" | "PENDING" {
    if (!currentJob) return "PENDING";

    const currentStageIndex = PIPELINE_STAGES.indexOf(currentJob.stage);
    const stageIndex = PIPELINE_STAGES.indexOf(stage);

    if (currentStageIndex === -1 || stageIndex === -1) return "PENDING";

    if (currentJob.status === "FAILED") {
      if (stageIndex < currentStageIndex) return "COMPLETED";
      if (stageIndex === currentStageIndex) return "FAILED";
      return "PENDING";
    }

    if (currentJob.status === "RUNNING") {
      if (stageIndex < currentStageIndex) return "COMPLETED";
      if (stageIndex === currentStageIndex) return "RUNNING";
      return "PENDING";
    }

    if (currentJob.status === "COMPLETED") {
      if (stageIndex <= currentStageIndex) return "COMPLETED";
    }

    return "PENDING";
  }

  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold mb-4">Job Pipeline</h2>

      <div className="space-y-4">
        {PIPELINE_STAGES.map((stage, index) => {
          const status = getStageStatus(stage);
          const isLast = index === PIPELINE_STAGES.length - 1;
          const durationSeconds = getStageDurationSeconds(stage);
          const errorMessage = getStageErrorMessage(stage);

          return (
            <div key={stage} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                    status === "COMPLETED"
                      ? "border-green-600 text-green-600"
                      : status === "FAILED"
                      ? "border-red-600 text-red-600"
                      : status === "RUNNING"
                      ? "border-blue-600 text-blue-600"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>

                {!isLast && (
                  <div
                    className={`w-px flex-1 mt-2 ${
                      status === "FAILED"
                        ? "bg-red-200"
                        : status === "COMPLETED"
                        ? "bg-green-200"
                        : status === "RUNNING"
                        ? "bg-blue-200"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              <div className="pt-1">
                <p className="font-medium">{stage}</p>
                <p className="text-xs text-gray-500">{status}</p>
                {durationSeconds != null && (
                  <p className="text-xs text-gray-500">
                    Duration: {durationSeconds.toFixed(2)} s
                  </p>
                )}
                {status === "FAILED" && errorMessage && (
                  <p className="text-red-500 text-xs">{errorMessage}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {timelineEvents.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Processing Timeline</h3>

          <div className="space-y-1">
            {timelineEvents.map((e, idx) => (
              <p key={`${e.ts}-${idx}`} className="text-xs text-gray-600 font-mono">
                {e.label}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}