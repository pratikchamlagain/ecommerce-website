# WatchMatrix Platform (Day 1 Scaffold)

This folder contains the new React + Node.js migration workspace.

## Workspace Structure

- `apps/web`: React (Vite) frontend
- `apps/api`: Express + Prisma backend

## Apps

- `frontend`: React (Vite) frontend
- `backend`: Express + Prisma backend
- Backend scaffold with Express app and health endpoint:
  - `GET /api/v1/health`
  - `User`, `Category`, `Product`, `Cart`, `CartItem`


cd apps/web
npm install
npm run dev
```
cd frontend
## Run Backend

```bash
cd apps/api
npm install
npm run dev
```
cd backend
## Prisma Notes

Before migration commands, update `DATABASE_URL` in `apps/api/.env`.

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
```
cd backend
## Next (Day 2)

- Build auth module (register/login/me)
- Add request validation and centralized error middleware
- Add product list endpoint with pagination + filtering

