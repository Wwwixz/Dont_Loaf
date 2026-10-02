import re
import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas import Token, UserLogin, UserOut, UserRegister
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
GOOGLE_STATE_COOKIE = "google_oauth_state"


def google_configured() -> bool:
    return bool(settings.google_client_id and settings.google_client_secret)


def google_redirect_uri() -> str:
    # Один и тот же вид пути работает и в проде (rewrite /api -> бэкенд),
    # и в dev (Astro-прокси на :8000). Именно этот URI надо вписать
    # в Google Cloud Console как Authorized redirect URI.
    return f"{settings.frontend_origin}/api/auth/google/callback"


def _frontend_redirect(path: str) -> RedirectResponse:
    return RedirectResponse(f"{settings.frontend_origin}{path}", status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)) -> Token:
    existing = db.execute(
        select(User).where((User.email == payload.email) | (User.username == payload.username))
    ).scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email или ник уже заняты")

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=str(user.id))
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
    user = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")

    token = create_access_token(subject=str(user.id))
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


# ---------- Google OAuth ----------


@router.get("/google")
def google_start() -> RedirectResponse:
    if not google_configured():
        return _frontend_redirect("/auth?error=google_not_configured")

    state = secrets.token_urlsafe(32)
    params = urlencode(
        {
            "client_id": settings.google_client_id,
            "redirect_uri": google_redirect_uri(),
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "prompt": "select_account",
        }
    )
    response = RedirectResponse(f"{GOOGLE_AUTH_URL}?{params}", status_code=status.HTTP_307_TEMPORARY_REDIRECT)
    # SameSite=Lax: кука дойдёт в топ-уровневом GET-редиректе от Google
    response.set_cookie(
        GOOGLE_STATE_COOKIE,
        state,
        max_age=600,
        httponly=True,
        samesite="lax",
        path="/api/auth",
    )
    return response


@router.get("/google/callback")
def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
) -> RedirectResponse:
    def fail(reason: str) -> RedirectResponse:
        response = _frontend_redirect(f"/auth?error={reason}")
        response.delete_cookie(GOOGLE_STATE_COOKIE, path="/api/auth")
        return response

    if error or not code or not state:
        return fail("google_error")

    cookie_state = request.cookies.get(GOOGLE_STATE_COOKIE)
    if not cookie_state or not secrets.compare_digest(state, cookie_state):
        return fail("google_state")

    token_data = {
        "code": code,
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "redirect_uri": google_redirect_uri(),
        "grant_type": "authorization_code",
    }
    try:
        token_response = httpx.post(GOOGLE_TOKEN_URL, data=token_data, timeout=15)
        if token_response.status_code != 200:
            return fail("google_exchange")
        access_token = token_response.json().get("access_token")
        if not access_token:
            return fail("google_exchange")

        userinfo_response = httpx.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=15,
        )
        if userinfo_response.status_code != 200:
            return fail("google_userinfo")
        userinfo = userinfo_response.json()
    except httpx.HTTPError:
        return fail("google_unreachable")

    email = userinfo.get("email")
    if not email or not userinfo.get("email_verified", False):
        return fail("google_no_email")

    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if user is None:
        # Имя пользователя — из Google-профиля, при коллизии добавляем суффикс
        base = re.sub(r"[^a-zA-Z0-9_-]+", "", userinfo.get("name") or email.split("@")[0]).strip("_-")
        base = (base or "user")[:40]
        username = base
        while db.execute(select(User).where(User.username == username)).scalar_one_or_none():
            username = f"{base}-{secrets.token_hex(3)}"

        user = User(
            username=username,
            email=email,
            # Пароль не используется: вход только по JWT после OAuth
            password_hash=hash_password(secrets.token_urlsafe(32)),
        )
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            return fail("google_user")

    jwt_token = create_access_token(subject=str(user.id))
    response = _frontend_redirect(f"/auth#access_token={jwt_token}")
    response.delete_cookie(GOOGLE_STATE_COOKIE, path="/api/auth")
    return response
