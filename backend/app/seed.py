"""
Создаёт тестового пользователя и демо-данные для локальной разработки.

Запуск:
    python -m app.seed
"""
from datetime import date, datetime, timedelta

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Note, Priority, Tag, Task, User
from app.security import hash_password

TEST_USER_EMAIL = "test@dontloaf.app"
TEST_USER_USERNAME = "testuser"
TEST_USER_PASSWORD = "Test1234!"


def get_or_create_tag(db, owner: User, name: str) -> Tag:
    tag = db.execute(select(Tag).where(Tag.owner_id == owner.id, Tag.name == name)).scalar_one_or_none()
    if tag is None:
        tag = Tag(owner_id=owner.id, name=name)
        db.add(tag)
        db.flush()
    return tag


def run() -> None:
    db = SessionLocal()
    try:
        user = db.execute(select(User).where(User.email == TEST_USER_EMAIL)).scalar_one_or_none()

        if user is None:
            user = User(
                username=TEST_USER_USERNAME,
                email=TEST_USER_EMAIL,
                password_hash=hash_password(TEST_USER_PASSWORD),
                xp=5260,
                streak_days=7,
                last_active_date=date.today(),
            )
            db.add(user)
            db.flush()
            print(f"Создан тестовый пользователь: {TEST_USER_EMAIL}")
        else:
            print(f"Тестовый пользователь уже существует: {TEST_USER_EMAIL}")

        existing_tasks = db.execute(select(Task).where(Task.owner_id == user.id)).scalars().all()
        if not existing_tasks:
            today = date.today()

            demo_tasks = [
                dict(
                    title="Сделать ДЗ по математике",
                    description="Решить задачи с 1 по 10 из учебника.",
                    category="Учёба",
                    priority=Priority.high,
                    due_date=today,
                    done=True,
                    tags=["математика"],
                    completed_days_ago=0,
                ),
                dict(
                    title="Прочитать книгу",
                    category="Саморазвитие",
                    priority=Priority.medium,
                    due_date=today,
                    done=True,
                    tags=["книги"],
                    completed_days_ago=0,
                ),
                dict(
                    title="Пробежка 5 км",
                    category="Здоровье",
                    priority=Priority.medium,
                    due_date=today + timedelta(days=1),
                    done=False,
                    tags=["спорт"],
                ),
                dict(
                    title="Разобрать почту",
                    category="Работа",
                    priority=Priority.low,
                    due_date=today + timedelta(days=1),
                    done=False,
                    tags=["работа"],
                ),
                dict(
                    title="Изучить React",
                    category="Проекты",
                    priority=Priority.medium,
                    due_date=today + timedelta(days=3),
                    done=False,
                    tags=["код"],
                ),
                dict(
                    title="Написать отчёт",
                    category="Работа",
                    priority=Priority.high,
                    due_date=today - timedelta(days=1),
                    done=True,
                    tags=["работа"],
                    completed_days_ago=1,
                ),
                dict(
                    title="Починить баг",
                    category="Работа",
                    priority=Priority.high,
                    due_date=today - timedelta(days=2),
                    done=True,
                    tags=["код"],
                    completed_days_ago=2,
                ),
            ]

            for item in demo_tasks:
                completed_days_ago = item.pop("completed_days_ago", None)
                tag_names = item.pop("tags")
                task = Task(owner_id=user.id, **item)
                task.tags = [get_or_create_tag(db, user, name) for name in tag_names]
                if task.done:
                    offset = completed_days_ago if completed_days_ago is not None else 0
                    task.completed_at = datetime.utcnow() - timedelta(days=offset)
                db.add(task)

            print(f"Добавлено {len(demo_tasks)} демо-задач")

        existing_notes = db.execute(select(Note).where(Note.owner_id == user.id)).scalars().all()
        if not existing_notes:
            demo_notes = [
                Note(
                    owner_id=user.id,
                    title="Планы на месяц",
                    content="1. Закончить проект\n2. Прочитать книгу\n3. Разобрать React",
                ),
                Note(
                    owner_id=user.id,
                    title="Идеи для проекта",
                    content="Список идей и заметок по текущим проектам",
                ),
            ]
            db.add_all(demo_notes)
            print(f"Добавлено {len(demo_notes)} демо-заметок")

        db.commit()
        print("\nГотово. Тестовые учётные данные:")
        print(f"  email:    {TEST_USER_EMAIL}")
        print(f"  password: {TEST_USER_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
