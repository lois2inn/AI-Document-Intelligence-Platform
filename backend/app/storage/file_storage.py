from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings

class FileStorageService:
    def __init__(self):
        self.upload_dir: Path = settings.upload_path
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save_upload_file(self, file: UploadFile) -> tuple[str, str]:
        original_name = file.filename or "uploaded_file"
        safe_name = original_name.replace(" ", "_")

        stored_name = f"{uuid4()}_{safe_name}"
        file_path = self.upload_dir / stored_name

        with file_path.open("wb") as buffer:
            buffer.write(file.file.read())

        return original_name, str(file_path)
    
    def delete_file(self, file_path: str) -> None:
        path = Path(file_path)

        if path.exists():
            path.unlink()