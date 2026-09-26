from collections import Counter
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Task, User
from app.schemas import AnalyticsSummary, CategoryBreakdown, DailyProgress

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def analytics_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AnalyticsSummary:
    tasks = list(
        db.execute(select(Task).where(Task.owner_id == current_user.id)).scalars().all()
    )

    total = len(tasks)
    completed = sum(1 for t in tasks if t.done)
    completion_rate = round((completed / total) * 100, 1) if total else 0.0

    category_counts = Counter(t.category for t in tasks)
    categories = [
        CategoryBreakdown(
            category=category,
            count=count,
            percent=round((count / total) * 100, 1) if total else 0.0,
        )
        for category, count in category_counts.most_common()
    ]

    today = date.today()
    week_start = today - timedelta(days=6)
    daily_progress = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        count = sum(1 for t in tasks if t.completed_at and t.completed_at.date() == day)
        daily_progress.append(DailyProgress(day=day, completed=count))

    return AnalyticsSummary(
        total_tasks=total,
        completed_tasks=completed,
        completion_rate=completion_rate,
        categories=categories,
        daily_progress=daily_progress,
    )
