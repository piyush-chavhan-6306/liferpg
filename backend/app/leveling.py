"""The RPG progression engine.

Non-linear XP curve: the amount of XP required to go from level N to N+1
grows as N grows, so early levels come quickly (dopamine early) and later
levels feel earned. Formula: xp_to_next(N) = floor(BASE * N ** EXPONENT)
"""
import math

BASE_XP = 80
EXPONENT = 1.45


def xp_to_next_level(level: int) -> int:
    return math.floor(BASE_XP * (level ** EXPONENT))


def apply_xp(character, xp_gained: int) -> int:
    """Mutates character.level / character.xp in place, applying however
    many level-ups the gained XP produces. Returns the number of levels
    gained (0 if none)."""
    character.xp += xp_gained
    levels_gained = 0
    while character.xp >= xp_to_next_level(character.level):
        character.xp -= xp_to_next_level(character.level)
        character.level += 1
        levels_gained += 1
    return levels_gained


def update_streak(character, today) -> bool:
    """Updates streak_count based on last_activity_date vs today (a date
    object). Returns True if the streak was extended (new day of activity),
    False if today was already logged."""
    last = character.last_activity_date.date() if character.last_activity_date else None

    if last == today:
        return False  # already active today, no double counting

    if last is not None and (today - last).days == 1:
        character.streak_count += 1
    else:
        character.streak_count = 1  # streak broken (or first ever activity)

    character.longest_streak = max(character.longest_streak, character.streak_count)
    character.last_activity_date = today
    return True
