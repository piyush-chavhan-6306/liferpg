import datetime as dt
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

from .models import Attribute, Difficulty, TaskStatus


# ---------- Auth ----------

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=24)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

    @field_validator("username")
    @classmethod
    def username_no_spaces(cls, v: str) -> str:
        v = v.strip()
        if not v.replace("_", "").isalnum():
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: str
    username: str
    email: EmailStr

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Character ----------

class CharacterOut(BaseModel):
    level: int
    xp: int
    xp_to_next: int
    gold: int
    intellect: int
    strength: int
    discipline: int
    creativity: int
    vitality: int
    streak_count: int
    longest_streak: int
    last_activity_date: Optional[dt.date] = None
    equipped_theme: str

    class Config:
        from_attributes = True


# ---------- Tasks ----------

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: Optional[str] = Field(default="", max_length=500)
    attribute: Attribute = Attribute.discipline
    difficulty: Difficulty = Difficulty.easy

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Quest title cannot be empty")
        return v.strip()


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    attribute: Optional[Attribute] = None
    difficulty: Optional[Difficulty] = None


class TaskOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    attribute: Attribute
    difficulty: Difficulty
    status: TaskStatus
    xp_reward: int
    gold_reward: int
    created_at: dt.datetime
    completed_at: Optional[dt.datetime] = None

    class Config:
        from_attributes = True


class CompletionResult(BaseModel):
    task: TaskOut
    character: CharacterOut
    leveled_up: bool
    levels_gained: int
    xp_gained: int
    gold_gained: int
    streak_extended: bool


# ---------- Shop ----------

class ShopItemOut(BaseModel):
    id: str
    name: str
    description: str
    cost: int
    category: str
    icon: str
    owned: bool = False

    class Config:
        from_attributes = True


class PurchaseResult(BaseModel):
    item: ShopItemOut
    character: CharacterOut


class EquipThemeRequest(BaseModel):
    theme_id: str
