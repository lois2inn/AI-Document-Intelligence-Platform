import { CheckCircle2, X } from "lucide-react";

type SuccessBannerProps = {
  title: string;
  message?: string;
  onDismiss?: () => void;
};

export default function SuccessBanner({
  title,
  message,
  onDismiss,
}: SuccessBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border border-green-200 bg-green-50 p-4"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 shrink-0 text-green-700"
        />

        <div className="min-w-0 flex-1">
          <p className="font-medium text-green-900">
            {title}
          </p>

          {message && (
            <p className="mt-1 text-sm text-green-700">
              {message}
            </p>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="rounded p-1 text-green-700 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}