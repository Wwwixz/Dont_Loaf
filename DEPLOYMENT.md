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

The backend needs an externally reachable PostgreSQL database; the local Docker
Compose database is not available to a Vercel deployment. Run database
migrations against the production database before using the API:

```sh
alembic upgrade head
```

The API health endpoint is `/health` and its interactive documentation is
available at `/docs`.

## Frontend and API URLs

The current frontend uses local demo data and does not make API requests.
`FRONTEND_ORIGIN` must match the deployed frontend origin for browser requests
to the API. The `/api` rewrite is configured in `vercel.json`.
