from sqlalchemy.orm import Session
from . import models

SHOP_CATALOG = [
    {"id": "theme-ember", "name": "Ember Journal", "description": "The default warm parchment-and-ember look.", "cost": 0, "category": "theme", "icon": "🔥"},
    {"id": "theme-frost", "name": "Frostbound Codex", "description": "A cold blue-and-silver theme for the disciplined.", "cost": 60, "category": "theme", "icon": "❄️"},
    {"id": "theme-verdant", "name": "Verdant Grimoire", "description": "Moss, ivy and old growth. A theme for the patient.", "cost": 60, "category": "theme", "icon": "🌿"},
    {"id": "theme-void", "name": "Void Ledger", "description": "Near-black with a single violet accent.", "cost": 120, "category": "theme", "icon": "🌑"},
    {"id": "badge-early-riser", "name": "Early Riser Sigil", "description": "A profile badge for those who show up daily.", "cost": 40, "category": "badge", "icon": "🌅"},
    {"id": "badge-scholar", "name": "Scholar's Seal", "description": "A profile badge honoring the intellect grind.", "cost": 50, "category": "badge", "icon": "📖"},
    {"id": "badge-ironwill", "name": "Ironwill Crest", "description": "A profile badge for streaks that refuse to break.", "cost": 90, "category": "badge", "icon": "🛡️"},
    {"id": "title-adept", "name": "Title: Adept", "description": "Display 'Adept' beside your name.", "cost": 70, "category": "title", "icon": "🏷️"},
    {"id": "title-archon", "name": "Title: Archon", "description": "Display 'Archon' beside your name.", "cost": 150, "category": "title", "icon": "👑"},
]


def seed_shop(db: Session) -> None:
    existing_ids = {row.id for row in db.query(models.ShopItemCatalog.id).all()}
    for item in SHOP_CATALOG:
        if item["id"] not in existing_ids:
            db.add(models.ShopItemCatalog(**item))
    db.commit()
