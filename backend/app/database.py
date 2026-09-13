from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

engine_kwargs = {}
if settings.DATABASE_URL.startswith("sqlite"):
    # Needed for SQLite + multiple threads (uvicorn workers)
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Production PostgreSQL / Supabase pooler optimizations
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 5,
        "max_overflow": 10,
    })

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
