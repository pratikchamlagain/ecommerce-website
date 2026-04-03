# WatchMatrix Platform (Day 1 Scaffold)

This folder contains the new React + Node.js migration workspace.

## Workspace Structure

- `apps/web`: React (Vite) frontend
- `apps/api`: Express + Prisma backend

## Day 1 Completed

- Frontend scaffold with route shell and pages:
  - `/`, `/products`, `/cart`, `/checkout`, `/about`
- Backend scaffold with Express app and health endpoint:
  - `GET /api/v1/health`
- Prisma initialized with baseline models:
  - `User`, `Category`, `Product`, `Cart`, `CartItem`
- Environment templates created in `apps/api/.env.example`

## Run Frontend

```bash
cd apps/web
npm install
npm run dev
```

## Run Backend

```bash
cd apps/api
npm install
npm run dev
```

## Prisma Notes

Before migration commands, update `DATABASE_URL` in `apps/api/.env`.

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
```

## Next (Day 2)

- Build auth module (register/login/me)
- Add request validation and centralized error middleware
- Add product list endpoint with pagination + filtering
