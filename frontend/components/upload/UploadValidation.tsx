const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = [".txt", ".rtf"];

export function validateUploadFile(file: File): string | null {
  const extension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    return "Only .txt and .rtf files are currently supported.";
  }

  // Some browsers don't populate file.type.
  if (
    file.type &&
    ![
      "text/plain",
      "application/rtf",
      "text/rtf",
    ].includes(file.type)
  ) {
    return "Unsupported file type.";
  }

  if (file.size === 0) {
    return "The selected file is empty.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "The file must be 5 MB or smaller.";
  }

  return null;
}