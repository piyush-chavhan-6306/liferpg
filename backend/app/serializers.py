from . import models, schemas
from .leveling import xp_to_next_level


def serialize_character(character: models.Character) -> schemas.CharacterOut:
    return schemas.CharacterOut(
        level=character.level,
        xp=character.xp,
        xp_to_next=xp_to_next_level(character.level),
        gold=character.gold,
        intellect=character.intellect,
        strength=character.strength,
        discipline=character.discipline,
        creativity=character.creativity,
        vitality=character.vitality,
        streak_count=character.streak_count,
        longest_streak=character.longest_streak,
        last_activity_date=character.last_activity_date.date() if character.last_activity_date else None,
        equipped_theme=character.equipped_theme,
    )
