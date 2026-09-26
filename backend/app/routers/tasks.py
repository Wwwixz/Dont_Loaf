import uuid
from datetime import date, datetime, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Tag, Task, User
from app.schemas import TaskCreate, TaskOut, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])

FilterOption = Literal["all", "today", "week", "month"]


def _resolve_tags(db: Session, owner: User, names: list[str]) -> list[Tag]:
    tags: list[Tag] = []
    for raw_name in names:
        name = raw_name.strip()
        if not name:
            continue
        tag = db.execute(
            select(Tag).where(Tag.owner_id == owner.id, Tag.name == name)
        ).scalar_one_or_none()
        if tag is None:
            tag = Tag(owner_id=owner.id, name=name)
            db.add(tag)
            db.flush()
        tags.append(tag)
    return tags


def _get_owned_task(db: Session, owner: User, task_id: uuid.UUID) -> Task:
    task = db.execute(
        select(Task).where(Task.id == task_id, Task.owner_id == owner.id)
    ).scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Задача не найдена")
    return task


@router.get("", response_model=list[TaskOut])
def list_tasks(
    filter: FilterOption = Query("all"),
    search: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Task]:
    stmt = select(Task).where(Task.owner_id == current_user.id)

    today = date.today()
    if filter == "today":
        stmt = stmt.where(Task.due_date == today)
    elif filter == "week":
        stmt = stmt.where(Task.due_date.between(today, today + timedelta(days=7)))
    elif filter == "month":
        stmt = stmt.where(Task.due_date.between(today, today + timedelta(days=30)))

    if search:
        stmt = stmt.where(Task.title.ilike(f"%{search}%"))

    stmt = stmt.order_by(Task.due_date.is_(None), Task.due_date, Task.created_at.desc())
    return list(db.execute(stmt).scalars().all())


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Task:
    task = Task(
        owner_id=current_user.id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        priority=payload.priority,
        due_date=payload.due_date,
        tags=_resolve_tags(db, current_user, payload.tags),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Task:
    return _get_owned_task(db, current_user, task_id)


@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Task:
    task = _get_owned_task(db, current_user, task_id)
    data = payload.model_dump(exclude_unset=True, exclude={"tags"})

    for field, value in data.items():
        setattr(task, field, value)

    if payload.tags is not None:
        task.tags = _resolve_tags(db, current_user, payload.tags)

    if payload.done is True and task.completed_at is None:
        task.completed_at = datetime.utcnow()
        current_user.xp += 50
    elif payload.done is False:
        task.completed_at = None

    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/toggle", response_model=TaskOut)
def toggle_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Task:
    task = _get_owned_task(db, current_user, task_id)
    task.done = not task.done

    if task.done:
        task.completed_at = datetime.utcnow()
        current_user.xp += 50
    else:
        task.completed_at = None
        current_user.xp = max(0, current_user.xp - 50)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    task = _get_owned_task(db, current_user, task_id)
    db.delete(task)
    db.commit()
