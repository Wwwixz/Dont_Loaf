from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import analytics, auth, notes, profile, tasks

settings = get_settings()

app = FastAPI(title="DontLoaf API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(analytics.router)
app.include_router(profile.router)
app.include_router(notes.router)

for router in (auth.router, tasks.router, analytics.router, profile.router, notes.router):
    app.include_router(router, prefix="/api", include_in_schema=False)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/health", tags=["health"], include_in_schema=False)
def api_health_check() -> dict[str, str]:
    return health_check()
