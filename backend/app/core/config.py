# backend/app/core/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str
    GOOGLE_APPLICATION_CREDENTIALS: str  # Path for Docker
    LOCAL_GCP_CREDENTIALS_PATH: str | None = (
        None  # Optional: For local non-Docker execution
    )
    FIREBASE_PROJECT_ID: str
    GCS_BUCKET_NAME: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra fields from .env


@lru_cache()  # Cache the settings object for performance
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

categories = [
    "Electronics",
    "Furniture",
    "Clothing",
    "Books",
    "Sports Equipment",
    "Home & Garden",
    "Toys & Games",
    "Collectibles",
    "Other",
]
