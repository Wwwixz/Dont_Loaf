# DontLoaf API

Бэкенд на **FastAPI + PostgreSQL** для приложения DontLoaf.

## Стек
- FastAPI + Uvicorn
- SQLAlchemy 2.0 + Alembic (миграции)
- PostgreSQL
- JWT-аутентификация (python-jose), пароли — bcrypt (passlib)

## Быстрый запуск через Docker (рекомендуется)

```bash
cp .env.example .env
docker compose up --build
```

Это поднимет Postgres, применит миграции, создаст тестового пользователя и запустит API на `http://localhost:8000`.

Документация API (Swagger): `http://localhost:8000/docs`

## Тестовый пользователь

После первого запуска (сидинга) доступен готовый аккаунт для входа с фронтенда:

| Email               | Пароль      |
|---------------------|-------------|
| test@dontloaf.app   | Test1234!   |

У него уже есть демо-задачи, теги и заметки — все экраны фронтенда (дерево задач, список задач, аналитика, профиль, Obsidian) сразу заполнены данными.

## Запуск без Docker

Требуется локальный PostgreSQL.

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# отредактируй .env: укажи свой DATABASE_URL и SECRET_KEY

alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

## Структура

```
app/
  main.py          — точка входа, роутеры, CORS
  config.py        — настройки (переменные окружения)
  database.py      — engine/session SQLAlchemy
  models.py        — User, Task, Tag, Note
  schemas.py       — Pydantic-схемы запросов/ответов
  security.py      — хеширование паролей, JWT
  deps.py          — get_current_user
  seed.py          — тестовый пользователь + демо-данные
  routers/
    auth.py        — регистрация, вход, /auth/me
    tasks.py       — CRUD задач, фильтры (today/week/month), теги
    analytics.py    — сводная статистика
    profile.py      — профиль + агрегированная статистика
    notes.py        — заметки (экран Obsidian)
alembic/           — миграции БД
```

## Основные эндпоинты

| Метод  | Путь                    | Описание                          |
|--------|-------------------------|------------------------------------|
| POST   | `/auth/register`        | Регистрация                        |
| POST   | `/auth/login`           | Вход, возвращает JWT               |
| GET    | `/auth/me`              | Текущий пользователь               |
| GET    | `/tasks?filter=today`   | Список задач (all/today/week/month)|
| POST   | `/tasks`                | Создать задачу                     |
| PUT    | `/tasks/{id}`           | Обновить задачу                    |
| PATCH  | `/tasks/{id}/toggle`    | Отметить выполненной/невыполненной |
| DELETE | `/tasks/{id}`           | Удалить задачу                     |
| GET    | `/analytics/summary`    | Статистика по категориям и дням    |
| GET    | `/profile`              | Профиль + XP/уровень/стрик         |
| GET    | `/notes`                | Список заметок                     |
| POST   | `/notes`                | Создать заметку                    |

Все эндпоинты, кроме `/auth/register` и `/auth/login`, требуют заголовок:
```
Authorization: Bearer <access_token>
```

## Подключение фронтенда

В `.env` укажи адрес фронтенда для CORS:
```
FRONTEND_ORIGIN=http://localhost:4321

```
