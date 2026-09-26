from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Task, User
from app.schemas import ProfileOut, ProfileStats, UserOut

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileOut)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileOut:
    tasks = list(
        db.execute(select(Task).where(Task.owner_id == current_user.id)).scalars().all()
    )

    total = len(tasks)
    completed = sum(1 for t in tasks if t.done)
    completion_rate = round((completed / total) * 100, 1) if total else 0.0

    today = date.today()
    week_start = today - timedelta(days=6)
    weekly_completed = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        count = sum(1 for t in tasks if t.completed_at and t.completed_at.date() == day)
        weekly_completed.append(count)

    stats = ProfileStats(
        total_tasks=total,
        completed_tasks=completed,
        completion_rate=completion_rate,
        streak_days=current_user.streak_days,
        weekly_completed=weekly_completed,
    )

    return ProfileOut(user=UserOut.model_validate(current_user), stats=stats)
