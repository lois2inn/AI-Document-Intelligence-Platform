type UploadProgressProps = {
  message: string;
};

export default function UploadProgress({
  message,
}: UploadProgressProps) {
  return (
    <div
      className="space-y-2"
      role="status"
      aria-live="polite"
    >
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="h-full w-1/3 animate-upload-progress rounded-full bg-gray-900" />
      </div>

      <p className="text-sm text-gray-600">
        {message}
      </p>
    </div>
  );
}