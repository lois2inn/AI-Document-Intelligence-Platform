
from pathlib import Path

from fastapi import UploadFile

from app.constants.file_types import SUPPORTED_UPLOAD_EXTENSIONS


class UnsupportedUploadTypeError(ValueError):
    pass


def validate_upload_file(file: UploadFile) -> str:
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()

    if not filename:
        raise UnsupportedUploadTypeError(
            "The uploaded file must have a filename."
        )

    if extension not in SUPPORTED_UPLOAD_EXTENSIONS:
        supported = ", ".join(
            sorted(SUPPORTED_UPLOAD_EXTENSIONS)
        )

        raise UnsupportedUploadTypeError(
            f"Unsupported file type. Supported types: {supported}."
        )

    return extension