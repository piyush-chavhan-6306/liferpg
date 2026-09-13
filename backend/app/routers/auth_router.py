from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        (models.User.username == payload.username) | (models.User.email == payload.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = models.User(
        username=payload.username,
        email=payload.email,
        hashed_password=auth.hash_password(payload.password),
    )
    db.add(user)
    db.flush()  # get user.id before creating the character row

    character = models.Character(user_id=user.id)
    db.add(character)
    db.commit()
    db.refresh(user)

    token = auth.create_access_token({"sub": user.id})
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        (models.User.username == payload.username) | (models.User.email == payload.username)
    ).first()
    if not user or not auth.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    token = auth.create_access_token({"sub": user.id})
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


@router.get("/me", response_model=schemas.UserOut)
def read_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@router.get("/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    return {"exists": bool(user), "username": user.username if user else None}


import re
import uuid


@router.post("/supabase-sync", response_model=schemas.Token)
def supabase_sync(payload: schemas.SupabaseSyncPayload, db: Session = Depends(get_db)):
    # Check if user already exists by email
    user = db.query(models.User).filter(models.User.email == payload.email).first()

    if not user:
        # Generate a clean unique username if not provided
        candidate_username = payload.username
        if not candidate_username:
            candidate_username = payload.email.split("@")[0]

        candidate_username = re.sub(r"[^a-zA-Z0-9_]", "", candidate_username)[:20]
        if len(candidate_username) < 3:
            candidate_username = f"knight_{uuid.uuid4().hex[:6]}"

        existing_u = db.query(models.User).filter(models.User.username == candidate_username).first()
        if existing_u:
            candidate_username = f"{candidate_username[:16]}_{uuid.uuid4().hex[:4]}"

        user = models.User(
            id=payload.supabase_uid or str(uuid.uuid4()),
            username=candidate_username,
            email=payload.email,
            hashed_password=None,
            auth_provider=payload.provider or "supabase",
            avatar_url=payload.avatar_url,
        )
        db.add(user)
        db.flush()

        character = models.Character(user_id=user.id)
        db.add(character)
        db.commit()
        db.refresh(user)
    else:
        if payload.avatar_url and not user.avatar_url:
            user.avatar_url = payload.avatar_url
        if payload.provider and user.auth_provider == "local":
            user.auth_provider = payload.provider

        if not user.character:
            character = models.Character(user_id=user.id)
            db.add(character)
        db.commit()
        db.refresh(user)

    token = auth.create_access_token({"sub": user.id})
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))
