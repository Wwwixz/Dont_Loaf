from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://dontloaf:dontloaf@db:5432/dontloaf"
    secret_key: str = "change-me-to-a-random-secret-key"
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"
    frontend_origin: str = "http://localhost:4321"

    # Google OAuth: пустые значения — вход через Google отключён
    google_client_id: str = ""
    google_client_secret: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
