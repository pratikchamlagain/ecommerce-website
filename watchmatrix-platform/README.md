# WatchMatrix Platform

This workspace is the active full-stack codebase for the React migration.

## Structure

- `frontend`: React (Vite) client
- `backend`: Express + Prisma API
- `docs`: migration notes and legacy reference

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Run Backend

```bash
cd backend
npm install
npm run dev
```

## Prisma Setup

Update `DATABASE_URL` in `backend/.env`, then run:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

## Pre-Deployment Checklist Command

Before deployment, run:

```bash
npm --prefix backend run predeploy:check
```

This checks:
- Required backend env vars and basic security constraints
- Presence of Prisma migrations
- Prisma client generation
- Frontend production build

## Seed Safety

The seed script now blocks production execution unless explicitly allowed.

To intentionally seed in production (not recommended by default), set:

```bash
ALLOW_PROD_SEED=true
```

## Current API

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/products`
- `GET /api/v1/products/:slug`

## Why Legacy Folders Were Removed

The old static HTML/CSS/JavaScript structure was removed from the repository root to avoid duplicate sources of truth.

All important legacy behavior and page intent is preserved in `docs/legacy-site-reference.md`.

Development now happens only inside this folder:

- `watchmatrix-platform/frontend`
- `watchmatrix-platform/backend`

