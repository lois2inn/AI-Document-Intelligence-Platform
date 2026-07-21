import type { DocumentJob, JobStage } from "@/lib/types";

const STAGES: JobStage[] = ["EXTRACTING", "CLEANING", "CHUNKING", "EMBEDDING", "DONE"];

type Props = {
  jobs: DocumentJob[];
};


export default function JobPipelineStepper({ jobs }: Props) {
  const currentJob = jobs.find((j) => j.status === "RUNNING") ?? jobs[0];

  type StageStatus = "COMPLETED" | "FAILED" | "RUNNING" | "PENDING";

  function getStageDisplayStatus(job: DocumentJob, stage: JobStage): StageStatus {
    const currentIndex = STAGES.indexOf(job.stage);
    const stageIndex = STAGES.indexOf(stage);

    if (currentIndex === -1 || stageIndex === -1) return "PENDING";

    if (job.status === "FAILED" && stageIndex === currentIndex) {
      return "FAILED";
    }

    if (stageIndex < currentIndex) {
      return "COMPLETED";
    }

    if (stageIndex === currentIndex) {
      return job.status;
    }

    return "PENDING";
  }

  function getStageStatus(stage: JobStage): StageStatus {
    if (!currentJob) return "PENDING";
    return getStageDisplayStatus(currentJob, stage);
  }

  return (
    <div className="space-y-4">
      {STAGES.map((stage, index) => {
        const status = getStageStatus(stage);
        const isLast = index === STAGES.length - 1;

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
            </div>
          </div>
        );
      })}
    </div>
  );
}