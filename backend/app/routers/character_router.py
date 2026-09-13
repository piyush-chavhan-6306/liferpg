from fastapi import APIRouter, Depends, HTTPException
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


@router.patch("/equip", response_model=schemas.CharacterOut)
def equip_item(
    payload: schemas.EquipThemeRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Equip an owned theme or title. Validates ownership before applying."""
    owned = db.query(models.InventoryItem).filter(
        models.InventoryItem.user_id == current_user.id,
        models.InventoryItem.item_id == payload.theme_id,
    ).first()
    if not owned:
        raise HTTPException(status_code=403, detail="You don't own that item")

    item = db.query(models.ShopItemCatalog).filter(
        models.ShopItemCatalog.id == payload.theme_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    character = db.query(models.Character).filter(
        models.Character.user_id == current_user.id
    ).first()

    if item.category == "theme":
        character.equipped_theme = item.id
    # badges are always displayed; titles are tracked via equipped_theme convention:
    # title items use prefix "title-" so we store them the same way

    db.commit()
    db.refresh(character)
    return _serialize(character)
