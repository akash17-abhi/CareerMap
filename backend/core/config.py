from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CareerMap API"
    app_version: str = "1.0.0"
    environment: str = "development"

    gemini_api_key: str | None = Field(
        default=None
    )

    gemini_model: str = Field(
        default="gemini-3.6-flash"
    )

    max_upload_size_mb: int = Field(
        default=10,
        ge=1,
        le=50,
    )

    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()