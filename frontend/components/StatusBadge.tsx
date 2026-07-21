import { CheckCircle, Clock3, AlertCircle, Loader2 } from "lucide-react";
import type { Status } from "@/lib/types";

type StatusBadgeProps = {
  status: Status;
  className?: string;
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    PENDING: {
      label: "Pending",
      className:
        "bg-gray-100 text-gray-700 border-gray-300",
      icon: Clock3,
    },
    PROCESSING: {
      label: "Processing",
      className:
        "bg-amber-100 text-amber-800 border-amber-300",
      icon: Loader2,
    },
    RUNNING: {
      label: "Running",
      className:
        "bg-blue-100 text-blue-800 border-blue-300",
      icon: Loader2,
    },
    COMPLETED: {
      label: "Completed",
      className:
        "bg-green-100 text-green-800 border-green-300",
      icon: CheckCircle,
    },
    FAILED: {
      label: "Failed",
      className:
        "bg-red-100 text-red-800 border-red-300",
      icon: AlertCircle,
    },
  };

  const { label, className: statusClassName, icon: Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusClassName}${className ? ` ${className}` : ""}`}
    >
      <Icon
        size={14}
        className={status === "PROCESSING" || status === "RUNNING"
          ? "animate-spin"
          : ""}
      />
      {label}
    </span>
  );
}
