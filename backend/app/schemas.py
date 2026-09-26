import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import Priority

# ---------- Auth / User ----------


class UserRegister(BaseModel):
    username: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    email: EmailStr
    xp: int
    level: int
    streak_days: int
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Tags ----------


class TagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str


# ---------- Tasks ----------


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    category: str = "Личное"
    priority: Priority = Priority.medium
    due_date: date | None = None
    tags: list[str] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    category: str | None = None
    priority: Priority | None = None
    due_date: date | None = None
    done: bool | None = None
    tags: list[str] | None = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    category: str
    priority: Priority
    due_date: date | None
    done: bool
    created_at: datetime
    completed_at: datetime | None
    tags: list[TagOut]


# ---------- Notes (Obsidian) ----------


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = ""


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    content: str
    created_at: datetime
    updated_at: datetime


# ---------- Analytics ----------


class CategoryBreakdown(BaseModel):
    category: str
    count: int
    percent: float


class DailyProgress(BaseModel):
    day: date
    completed: int


class AnalyticsSummary(BaseModel):
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    categories: list[CategoryBreakdown]
    daily_progress: list[DailyProgress]


# ---------- Profile ----------


class ProfileStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    streak_days: int
    weekly_completed: list[int]


class ProfileOut(BaseModel):
    user: UserOut
    stats: ProfileStats
