import os
from typing import Optional

class Settings:
    PROJECT_NAME: str = "FinStudent AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "finstudent_super_secret_jwt_key_2026_idp_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database: SQLite default, PostgreSQL compatible
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finstudent.db")

    # Local ML / AI fallback mode (no external keys required)
    FALLBACK_MODE: bool = os.getenv("FALLBACK_MODE", "true").lower() in ("true", "1", "yes")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)

settings = Settings()
