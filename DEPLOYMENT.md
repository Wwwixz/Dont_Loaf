# Deploying to Vercel

The root [vercel.json](./vercel.json) defines the Astro frontend and FastAPI
backend as Vercel services, sets the Python application entrypoint, and routes
requests to them.

Before deploying, configure these environment variables for the backend in
Vercel:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | PostgreSQL URL, for example `postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE` |
| `SECRET_KEY` | A unique, randomly generated secret; do not use the development default |
| `FRONTEND_ORIGIN` | The deployed frontend origin, for example `https://your-frontend.vercel.app` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Optional; defaults to `1440` |
| `GOOGLE_CLIENT_ID` | Optional; Google OAuth client ID for "Sign in with Google" |
| `GOOGLE_CLIENT_SECRET` | Optional; Google OAuth client secret |

## Google sign-in

The Google button on `/auth` calls `/api/auth/google`, which redirects to
Google and returns to `/api/auth/google/callback`. The redirect URI sent to
Google is `{FRONTEND_ORIGIN}/api/auth/google/callback`, so register exactly
that URL (for example `https://your-frontend.vercel.app/api/auth/google/callback`)
as an Authorized redirect URI of a Web-application OAuth client in Google
Cloud Console. When the two `GOOGLE_*` variables are unset, the button shows
a "not configured" message instead of redirecting.

The backend needs an externally reachable PostgreSQL database; the local Docker
Compose database is not available to a Vercel deployment. The Neon Vercel
integration provides `DATABASE_URL` (using the `DATABASE` variable prefix).
Run database migrations against the production database before registering or
signing in:

```sh
alembic upgrade head
```

The API health endpoint is `/health` and its interactive documentation is
available at `/docs`. Vercel routes the equivalent prefixed health check at
`/api/health`.

## Frontend and API URLs

All frontend screens are wired to the API: authentication, tasks (list,
filters, toggle, editor), task tree, analytics, profile and notes all call
`/api/...` and render the signed-in user's data. The sign-in and registration
forms call `/api/auth/login` and `/api/auth/register`. `FRONTEND_ORIGIN` must
match the deployed frontend origin for browser requests to the API.

After configuring the database and deploying, create an account at
`/auth?mode=register`. The demo account in the backend README is created only
when the seed script is run; it is not created automatically in production.
