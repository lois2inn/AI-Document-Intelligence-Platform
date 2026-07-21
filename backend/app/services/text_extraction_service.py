from pathlib import Path

from striprtf.striprtf import rtf_to_text

from app.constants.file_types import SUPPORTED_UPLOAD_EXTENSIONS
from app.models.document import Document
from app.models.document import DocumentSourceType

class UnsupportedFileTypeError(ValueError):
    pass

class UnsupportedSourceTypeError(ValueError):
    pass

class TextExtractionError(ValueError):
    pass


class TextExtractionService:

    def extract_text(self, document: Document) -> str:

        if document.source_type == DocumentSourceType.NOTE:
            return document.raw_text or ""

        if document.source_type == DocumentSourceType.URL:
            return document.raw_text or ""

        if document.source_type == DocumentSourceType.FILE:
            return self._extract_uploaded_file(document)

        raise UnsupportedSourceTypeError(
            f"Unsupported document source type: {document.source_type}"
        )


    def _extract_uploaded_file(self, document: Document) -> str:
        if not document.file_path:
            raise TextExtractionError(
                f"File document {document.id} does not have a file path."
            )

        path = Path(document.file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Uploaded file not found: {document.file_path}"
            )

        if not path.is_file():
            raise TextExtractionError(
                f"Document path is not a file: {document.file_path}"
            )

        extension = path.suffix.lower()

        if extension not in SUPPORTED_UPLOAD_EXTENSIONS:
            raise UnsupportedFileTypeError(
                f"Unsupported file type: {extension or 'unknown'}"
            )

        try:
            if extension == ".txt":
                return self._extract_txt(path)

            if extension == ".rtf":
                return self._extract_rtf(path)

        except (OSError, UnicodeError) as exc:
            raise TextExtractionError(
                f"Unable to extract text from {path.name}."
            ) from exc

        raise UnsupportedFileTypeError(
            f"Text extraction is not implemented for: {extension}"
        )

    def _extract_txt(self, path: Path) -> str:
        text = self._decode_text(path.read_bytes())

        # Defensive handling for RTF content saved with a .txt extension.
        if text.lstrip().startswith(r"{\rtf"):
            return rtf_to_text(text, errors="replace")

        return text


    def _extract_rtf(self, path: Path) -> str:
        rtf_content = self._decode_text(path.read_bytes())

        if not rtf_content.lstrip().startswith(r"{\rtf"):
            raise TextExtractionError(
                f"{path.name} has an .rtf extension but does not appear to contain RTF data."
            )

        return rtf_to_text(
            rtf_content,
            errors="replace",
        )


    def _decode_text(self, raw_bytes: bytes) -> str:
        try:
            return raw_bytes.decode("utf-8")
        except UnicodeDecodeError:
            return raw_bytes.decode(
                "cp1252",
                errors="replace",
            )

