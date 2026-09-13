from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .config import settings
from .seed import seed_shop
from .routers import auth_router, tasks_router, character_router, shop_router

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed shop catalog safely on startup
    try:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            seed_shop(db)
        logger.info("Database schema initialized and shop catalog seeded.")
    except Exception as e:
        logger.error(f"Database initialization warning: {e}")
    yield


app = FastAPI(title="Life RPG API", version="1.0.0", lifespan=lifespan)

# Allow all Vercel preview/production domains plus configured origins
has_wildcard = "*" in settings.CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if has_wildcard else settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=not has_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(character_router.router)
app.include_router(tasks_router.router)
app.include_router(shop_router.router)


import os
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

# Setup frontend static assets serving
FRONTEND_DIST = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
)
assets_dir = os.path.join(FRONTEND_DIST, "assets")
if os.path.isdir(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "life-rpg-api"}


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path:
        target_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(target_path):
            return FileResponse(target_path)

    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.isfile(index_file):
        return FileResponse(
            index_file,
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        )

    return {"status": "ok", "service": "life-rpg-api"}
