from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..serializers import serialize_character as _serialize

router = APIRouter(prefix="/character", tags=["character"])


@router.get("", response_model=schemas.CharacterOut)
def get_character(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    character = db.query(models.Character).filter(
        models.Character.user_id == current_user.id
    ).first()
    return _serialize(character)
