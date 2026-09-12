from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..serializers import serialize_character

router = APIRouter(prefix="/shop", tags=["shop"])


@router.get("", response_model=list[schemas.ShopItemOut])
def list_shop_items(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    items = db.query(models.ShopItemCatalog).all()
    owned_ids = {
        row.item_id for row in db.query(models.InventoryItem).filter(
            models.InventoryItem.user_id == current_user.id
        ).all()
    }
    out = []
    for item in items:
        out.append(schemas.ShopItemOut(
            id=item.id, name=item.name, description=item.description,
            cost=item.cost, category=item.category, icon=item.icon,
            owned=item.id in owned_ids,
        ))
    return out


@router.post("/{item_id}/purchase", response_model=schemas.PurchaseResult)
def purchase_item(
    item_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(models.ShopItemCatalog).filter(models.ShopItemCatalog.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    already_owned = db.query(models.InventoryItem).filter(
        models.InventoryItem.user_id == current_user.id,
        models.InventoryItem.item_id == item_id,
    ).first()
    if already_owned:
        raise HTTPException(status_code=400, detail="You already own this")

    character = db.query(models.Character).filter(
        models.Character.user_id == current_user.id
    ).first()

    # Price is re-checked server-side against the catalog row, not trusted
    # from the client, so there's nothing to tamper with in the request.
    if character.gold < item.cost:
        raise HTTPException(status_code=400, detail="Not enough gold")

    character.gold -= item.cost
    db.add(models.InventoryItem(user_id=current_user.id, item_id=item.id))

    if item.category == "theme":
        character.equipped_theme = item.id

    db.commit()
    db.refresh(character)

    return schemas.PurchaseResult(
        item=schemas.ShopItemOut(
            id=item.id, name=item.name, description=item.description,
            cost=item.cost, category=item.category, icon=item.icon, owned=True,
        ),
        character=serialize_character(character),
    )


@router.get("/inventory/mine", response_model=list[schemas.ShopItemOut])
def my_inventory(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.query(models.InventoryItem).filter(
        models.InventoryItem.user_id == current_user.id
    ).all()
    items = []
    for row in rows:
        cat = db.query(models.ShopItemCatalog).filter(models.ShopItemCatalog.id == row.item_id).first()
        if cat:
            items.append(schemas.ShopItemOut(
                id=cat.id, name=cat.name, description=cat.description,
                cost=cat.cost, category=cat.category, icon=cat.icon, owned=True,
            ))
    return items
