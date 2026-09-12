import datetime as dt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..models import DIFFICULTY_REWARDS, TaskStatus
from ..leveling import apply_xp, update_streak
from ..serializers import serialize_character

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _get_owned_task(task_id: str, user_id: str, db: Session) -> models.Task:
    task = db.query(models.Task).filter(
        models.Task.id == task_id, models.Task.user_id == user_id
    ).first()
    if not task:
        # 404, not 403 — don't reveal whether the id exists for another user
        raise HTTPException(status_code=404, detail="Quest not found")
    return task


@router.get("", response_model=list[schemas.TaskOut])
def list_tasks(
    status_filter: TaskStatus | None = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(models.Task).filter(models.Task.user_id == current_user.id)
    if status_filter:
        q = q.filter(models.Task.status == status_filter)
    return q.order_by(models.Task.created_at.desc()).all()


@router.post("", response_model=schemas.TaskOut, status_code=201)
def create_task(
    payload: schemas.TaskCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    rewards = DIFFICULTY_REWARDS[payload.difficulty]
    task = models.Task(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description or "",
        attribute=payload.attribute,
        difficulty=payload.difficulty,
        xp_reward=rewards["xp"],
        gold_reward=rewards["gold"],
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: str,
    payload: schemas.TaskUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    task = _get_owned_task(task_id, current_user.id, db)
    if task.status == TaskStatus.completed:
        raise HTTPException(status_code=400, detail="Completed quests can't be edited")

    data = payload.model_dump(exclude_unset=True)
    if "difficulty" in data and data["difficulty"] is not None:
        rewards = DIFFICULTY_REWARDS[data["difficulty"]]
        task.xp_reward = rewards["xp"]
        task.gold_reward = rewards["gold"]
    for field, value in data.items():
        if value is not None:
            setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    task = _get_owned_task(task_id, current_user.id, db)
    db.delete(task)
    db.commit()
    return None


@router.post("/{task_id}/complete", response_model=schemas.CompletionResult)
def complete_task(
    task_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    task = _get_owned_task(task_id, current_user.id, db)
    if task.status == TaskStatus.completed:
        raise HTTPException(status_code=400, detail="Quest already completed")

    character = db.query(models.Character).filter(
        models.Character.user_id == current_user.id
    ).first()

    # All reward math happens server-side from the task's stored reward
    # values (set at creation time from the difficulty table) — the client
    # never gets to say how much XP/gold a completion is worth.
    levels_before = character.level
    levels_gained = apply_xp(character, task.xp_reward)
    character.gold += task.gold_reward

    attr_field = task.attribute.value
    setattr(character, attr_field, getattr(character, attr_field) + 1)

    streak_extended = update_streak(character, dt.datetime.utcnow().date())

    task.status = TaskStatus.completed
    task.completed_at = dt.datetime.utcnow()

    db.commit()
    db.refresh(task)
    db.refresh(character)

    return schemas.CompletionResult(
        task=task,
        character=serialize_character(character),
        leveled_up=levels_gained > 0,
        levels_gained=levels_gained,
        xp_gained=task.xp_reward,
        gold_gained=task.gold_reward,
        streak_extended=streak_extended,
    )
