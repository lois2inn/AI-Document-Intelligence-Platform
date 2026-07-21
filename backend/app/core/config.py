from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Knowledge Tracker API"

    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    openrouter_api_key: str
    openrouter_base_url: str

    openai_api_key: str | None = None
    openai_base_url: str = "https://api.openai.com/v1"

    upload_dir: str = "uploads"

    embedding_provider: str
    embedding_model: str
    chat_provider: str
    chat_model: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.postgres_user}:"
            f"{self.postgres_password}@{self.postgres_host}:"
            f"{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def upload_path(self) -> Path:
        return Path(self.upload_dir)

settings = Settings()