# WatchMatrix Platform

This workspace contains the migrated full-stack application.

## Structure

- `frontend`: React (Vite) client
- `backend`: Express + Prisma API

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

## Current API

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/products`
- `GET /api/v1/products/:slug`

