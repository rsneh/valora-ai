import os
from pydantic_settings import BaseSettings
from functools import lru_cache
from dotenv import load_dotenv

project_root = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)  # Adjust '..' as needed
dotenv_path = os.path.join(project_root, ".env")

if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)


class Settings(BaseSettings):
    DATABASE_URL: str
    GOOGLE_APPLICATION_CREDENTIALS: str
    LOCAL_GCP_CREDENTIALS_PATH: str | None = None
    FIREBASE_PROJECT_ID: str
    GCS_BUCKET_NAME: str
    ADMIN_EMAIL: str | None = None
    BREVO_API_KEY: str | None = None
    FRONTEND_BASE_URL: str = "https://www.valoraai.net"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra fields from .env


@lru_cache()  # Cache the settings object for performance
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
