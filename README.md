# JobTrack

JobTrack is a personal tracker for jobs, internships, and freelance
opportunities. It lets you save opportunities, record where you are in
the process (saved, applied, interview, offer, rejected, closed), and
search/filter them.

## Technology stack

- **Frontend:** React + Vite, plain JavaScript, plain CSS
- **Backend:** Node.js + Express, plain JavaScript
- **Database:** PostgreSQL
- **API:** REST (JSON over HTTP)

No TypeScript, Redux, Docker, GraphQL, authentication, or other
frameworks are used — the app is intentionally kept simple.

## Project structure

```
jobtrack/
├── backend/
│   ├── src/
│   │   ├── server.js                   # Express app entry point
│   │   ├── config/db.js                # PostgreSQL connection pool
│   │   ├── routes/opportunities.js     # REST endpoints
│   │   ├── services/opportunitiesService.js  # Queries + validation
│   │   └── db/
│   │       ├── migration.sql           # Database schema
│   │       └── migrate.js              # Migration runner
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx                     # Dashboard, list, forms, detail view
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── services/api.js             # API client (configurable base URL)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── .env.production                 # Sets API base to /api for production builds
└── deploy/                             # AWS EC2 deployment configuration
    ├── DEPLOYMENT.md                   # Step-by-step deployment + verification guide
    ├── deploy.sh                       # Install/build/configure script for the EC2 instance
    ├── nginx-jobtrack.conf             # Nginx site config (static files + /api proxy)
    └── jobtrack-backend.service        # systemd unit for the backend
```

## PostgreSQL setup

1. Install PostgreSQL and create a database named `jobtrack`.
2. Run the migration to create the schema:
   ```bash
   cd backend
   npm run migrate
   ```
   This executes `src/db/migration.sql`, which creates a single
   `opportunities` table (with `type`, `status`, and `work_arrangement`
   restricted to specific allowed values via `CHECK` constraints).

In production, use a dedicated, non-superuser PostgreSQL role for the
application rather than the default `postgres` superuser (see
`deploy/deploy.sh`, which creates one automatically).

## Environment variables

**`backend/.env`** (copy from `backend/.env.example`):
```
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/jobtrack
```

**`frontend/.env`** (copy from `frontend/.env.example`, for local development):
```
VITE_API_BASE_URL=http://localhost:5000/api
```

`frontend/.env.production` is already set to `VITE_API_BASE_URL=/api` so
that a production build calls a relative `/api` path — this is what lets
Nginx proxy API requests to the backend after deployment, instead of the
build calling `localhost` in production.

Never commit a `.env` file containing real credentials.

## Install backend dependencies

```bash
cd backend
npm install
```

## Install frontend dependencies

```bash
cd frontend
npm install
```

## Run database migrations

```bash
cd backend
npm run migrate
```

## Start the backend

```bash
cd backend
npm start
```

The backend listens on the `PORT` from `.env` (default `5000`).

## Start the frontend

```bash
cd frontend
npm run dev
```

## Local development URL

Frontend: http://localhost:5173
Backend API: http://localhost:5000/api

## API health endpoint

```
GET /api/health
```

Returns:
```json
{ "status": "ok" }
```

## Basic AWS deployment information

The app is designed to run on a single Ubuntu EC2 instance: Nginx on
port 80 serves the React production build and proxies `/api/*` to the
Node/Express backend, which listens only on `127.0.0.1:5000`; PostgreSQL
runs locally on the same instance and is not exposed publicly.

Full step-by-step deployment instructions, the Nginx config, and the
systemd service file are in `deploy/`. Start with `deploy/DEPLOYMENT.md`.

## Important security notes

- PostgreSQL and the backend (port 5000) must never be exposed publicly
  — only Nginx (port 80) should be reachable from the internet.
- Run the application against a dedicated, non-superuser PostgreSQL
  role, not the `postgres` superuser.
- Never commit `.env` files with real credentials, AWS credentials, or
  SSH private keys.
- The application has no authentication layer by design (Part 1 scope);
  do not expose it on a network where that's a concern without adding
  appropriate access controls first.
