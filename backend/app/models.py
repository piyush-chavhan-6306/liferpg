import datetime as dt
import enum
import uuid

from sqlalchemy import (
    Column, String, Integer, Float, DateTime, ForeignKey, Enum, Boolean, UniqueConstraint
)
from sqlalchemy.orm import relationship

from .database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class Attribute(str, enum.Enum):
    intellect = "intellect"
    strength = "strength"
    discipline = "discipline"
    creativity = "creativity"
    vitality = "vitality"


class Difficulty(str, enum.Enum):
    trivial = "trivial"
    easy = "easy"
    medium = "medium"
    hard = "hard"
    epic = "epic"


# Base XP/gold reward per difficulty tier. Tuned so an "epic" quest is a
# meaningfully bigger payoff than a "trivial" one, without letting a single
# task trivialize the whole progression curve.
DIFFICULTY_REWARDS = {
    Difficulty.trivial: {"xp": 8, "gold": 2},
    Difficulty.easy: {"xp": 15, "gold": 5},
    Difficulty.medium: {"xp": 30, "gold": 12},
    Difficulty.hard: {"xp": 55, "gold": 22},
    Difficulty.epic: {"xp": 100, "gold": 45},
}


class TaskStatus(str, enum.Enum):
    active = "active"
    completed = "completed"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    character = relationship("Character", back_populates="user", uselist=False, cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    inventory = relationship("InventoryItem", back_populates="user", cascade="all, delete-orphan")


class Character(Base):
    """Holds all progression state for a user. One-to-one with User."""
    __tablename__ = "characters"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)

    level = Column(Integer, default=1, nullable=False)
    xp = Column(Integer, default=0, nullable=False)  # xp earned toward current level
    gold = Column(Integer, default=25, nullable=False)  # starting gold

    # Attribute stats
    intellect = Column(Integer, default=0, nullable=False)
    strength = Column(Integer, default=0, nullable=False)
    discipline = Column(Integer, default=0, nullable=False)
    creativity = Column(Integer, default=0, nullable=False)
    vitality = Column(Integer, default=0, nullable=False)

    # Streak tracking
    streak_count = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_activity_date = Column(DateTime, nullable=True)  # date-only precision used

    equipped_theme = Column(String, default="ember", nullable=False)

    user = relationship("User", back_populates="character")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String, nullable=False)
    description = Column(String, default="", nullable=True)
    attribute = Column(Enum(Attribute), default=Attribute.discipline, nullable=False)
    difficulty = Column(Enum(Difficulty), default=Difficulty.easy, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.active, nullable=False)

    xp_reward = Column(Integer, nullable=False)
    gold_reward = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=dt.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="tasks")


class ShopItemCatalog(Base):
    """Static-ish catalog row, seeded at startup. Kept in DB (not hardcoded
    only in frontend) so purchases can be validated server-side against the
    real price, closing the obvious 'edit the request payload' cheat."""
    __tablename__ = "shop_items"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    cost = Column(Integer, nullable=False)
    category = Column(String, nullable=False)  # "theme" | "badge" | "title"
    icon = Column(String, default="✦")


class InventoryItem(Base):
    __tablename__ = "inventory_items"
    __table_args__ = (UniqueConstraint("user_id", "item_id", name="uq_user_item"),)

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    item_id = Column(String, ForeignKey("shop_items.id"), nullable=False)
    purchased_at = Column(DateTime, default=dt.datetime.utcnow)

    user = relationship("User", back_populates="inventory")
