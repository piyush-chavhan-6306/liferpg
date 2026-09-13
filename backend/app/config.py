import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

    # Support Supabase / Heroku postgres:// prefix by converting to postgresql:// for SQLAlchemy
    _raw_db: str = (os.getenv("DATABASE_URL") or "sqlite:///./liferpg.db").strip()
    if _raw_db.startswith("postgres://"):
        _raw_db = _raw_db.replace("postgres://", "postgresql://", 1)
    DATABASE_URL: str = _raw_db

    # Comma-separated CORS origins or *
    _raw_cors: str = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,*"
    )
    CORS_ORIGINS: list[str] = [o.strip() for o in _raw_cors.split(",") if o.strip()]


settings = Settings()
