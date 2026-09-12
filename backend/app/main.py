from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .config import settings
from .seed import seed_shop
from .routers import auth_router, tasks_router, character_router, shop_router

Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_shop(db)

app = FastAPI(title="Life RPG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(character_router.router)
app.include_router(tasks_router.router)
app.include_router(shop_router.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "life-rpg-api"}
