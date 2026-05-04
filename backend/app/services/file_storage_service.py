from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings


def save_upload_file(file: UploadFile) -> tuple[str, str]:
    upload_dir: Path = settings.upload_path
    upload_dir.mkdir(parents=True, exist_ok=True)

    original_name = file.filename or "uploaded_file"
    safe_name = original_name.replace(" ", "_")

    stored_name = f"{uuid4()}_{safe_name}"
    file_path = upload_dir / stored_name

    with file_path.open("wb") as buffer:
        buffer.write(file.file.read())

    return original_name, str(file_path)