# React + Node.js Migration Plan for WatchMatrix

## 1) Recommended Stack

- Frontend: React + Vite + React Router + React Query
- Backend: Node.js + Express + Prisma ORM
- Database: PostgreSQL
- Auth: JWT (access + refresh token)
- Validation: Zod
- Styling: Tailwind CSS (or keep current CSS and migrate gradually)
- File storage: Cloudinary
- Payments: Khalti/eSewa (local) or Stripe (global)
- Deploy:
  - Frontend: Vercel or Netlify
  - Backend: Render or Railway
  - Database: Neon or Supabase Postgres

## 2) Monorepo Folder Structure

```text
watchmatrix-platform/
  apps/
    web/                         # React app
      src/
        app/
          router.jsx
          providers.jsx
        components/
          common/
          product/
          cart/
          checkout/
        features/
          auth/
          products/
          cart/
          orders/
        pages/
          HomePage.jsx
          ProductsPage.jsx
          ProductDetailPage.jsx
          CartPage.jsx
          CheckoutPage.jsx
          BlogPage.jsx
          AboutPage.jsx
          NotFoundPage.jsx
        lib/
          apiClient.js
          formatters.js
        styles/
        main.jsx
      public/
      index.html
      package.json
      vite.config.js

    api/                         # Express API
      src/
        app.js
        server.js
        config/
          env.js
          db.js
        middlewares/
          auth.js
          errorHandler.js
          validateRequest.js
          rateLimit.js
        modules/
          auth/
            auth.controller.js
            auth.service.js
            auth.routes.js
            auth.schema.js
          users/
          products/
          categories/
          cart/
          orders/
          payments/
          uploads/
        utils/
          logger.js
          pagination.js
      prisma/
        schema.prisma
        migrations/
        seed.js
      package.json

  packages/
    shared/                      # shared types/constants/utils

  docs/
    api-contract.md
    deployment.md
  .env.example
  README.md
```

## 3) Database Schema (PostgreSQL + Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model User {
  id           String    @id @default(cuid())
  fullName     String
  email        String    @unique
  passwordHash String
  role         UserRole  @default(CUSTOMER)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  addresses    Address[]
  cart         Cart?
  orders       Order[]
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Address {
  id         String   @id @default(cuid())
  userId     String
  label      String?
  phone      String
  line1      String
  line2      String?
  city       String
  state      String?
  postalCode String?
  country    String
  isDefault  Boolean  @default(false)

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders     Order[]
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  createdAt DateTime  @default(now())

  products  Product[]
}

model Product {
  id            String      @id @default(cuid())
  name          String
  slug          String      @unique
  description   String
  brand         String
  price         Decimal     @db.Decimal(10,2)
  compareAtPrice Decimal?   @db.Decimal(10,2)
  rating        Float       @default(0)
  stock         Int         @default(0)
  images        ProductImage[]
  categoryId    String
  isPublished   Boolean     @default(true)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  category      Category    @relation(fields: [categoryId], references: [id])
  orderItems    OrderItem[]
  cartItems     CartItem[]
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String
  url       String
  alt       String?
  sortOrder Int      @default(0)

  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  updatedAt DateTime   @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  productId String
  quantity  Int      @default(1)

  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id])

  @@unique([cartId, productId])
}

model Order {
  id             String      @id @default(cuid())
  userId         String
  addressId      String
  status         OrderStatus @default(PENDING)
  subtotal       Decimal     @db.Decimal(10,2)
  shippingFee    Decimal     @db.Decimal(10,2)
  discount       Decimal     @default(0) @db.Decimal(10,2)
  total          Decimal     @db.Decimal(10,2)
  paymentMethod  String
  paymentRef     String?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  user           User        @relation(fields: [userId], references: [id])
  address        Address     @relation(fields: [addressId], references: [id])
  items          OrderItem[]
}

model OrderItem {
  id           String   @id @default(cuid())
  orderId      String
  productId    String
  unitPrice    Decimal  @db.Decimal(10,2)
  quantity     Int
  lineTotal    Decimal  @db.Decimal(10,2)

  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product      Product  @relation(fields: [productId], references: [id])
}
```

## 4) REST API Contract (v1)

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Products + Categories

- `GET /api/v1/categories`
- `GET /api/v1/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=`
- `GET /api/v1/products/:slug`
- `POST /api/v1/products` (admin)
- `PATCH /api/v1/products/:id` (admin)
- `DELETE /api/v1/products/:id` (admin)

### Cart

- `GET /api/v1/cart`
- `POST /api/v1/cart/items` `{ productId, quantity }`
- `PATCH /api/v1/cart/items/:productId` `{ quantity }`
- `DELETE /api/v1/cart/items/:productId`
- `DELETE /api/v1/cart`

### Address + Checkout + Orders

- `GET /api/v1/addresses`
- `POST /api/v1/addresses`
- `PATCH /api/v1/addresses/:id`
- `DELETE /api/v1/addresses/:id`
- `POST /api/v1/checkout/preview`
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/:id`

### Payments

- `POST /api/v1/payments/initiate`
- `POST /api/v1/payments/verify`

## 5) Frontend Route Plan

- `/` Home
- `/products` Products listing
- `/products/:slug` Product detail
- `/cart` Cart
- `/checkout` Checkout
- `/orders` My orders
- `/orders/:id` Order detail
- `/blog` Blog
- `/about` About
- `/admin/*` Admin dashboard routes

## 6) Migration Steps from Current Project

### Step A: Extract reusable UI pieces

- Header
- Footer
- Product card
- Search/filter bar
- Cart row
- Form fields

### Step B: Build React shell first

- Build static routes that mirror your existing pages.
- Copy images/assets first to keep visual continuity.

### Step C: Integrate backend gradually

- Start with products API.
- Replace static JS product arrays with API calls.
- Then connect cart endpoints.
- Then checkout and orders.

### Step D: Kill duplicate logic

- Remove duplicate `addToCart` versions.
- Centralize cart and price utils in one place.

## 7) 7-Day Execution Plan

### Day 1

- Create `apps/web` and `apps/api`
- Setup lint + prettier + env
- Setup PostgreSQL + Prisma

### Day 2

- Implement auth module (register/login/me)
- Add protected routes on frontend

### Day 3

- Implement categories + products API
- Build Products page with filters/sort/search

### Day 4

- Implement cart API
- Build Cart page with quantity controls, remove, totals

### Day 5

- Implement address + checkout preview + create order
- Build Checkout page with validation and summary

### Day 6

- Add payment gateway integration
- Add order tracking page

### Day 7

- Add admin CRUD for products/orders
- Add tests, docs, deploy frontend/backend/db

## 8) Deployment Checklist

- [ ] `.env.example` created for web and api
- [ ] CORS configured for frontend domain
- [ ] API base URL via environment variables
- [ ] Prisma migrations applied in production
- [ ] Seed script available for demo products
- [ ] Error logger enabled
- [ ] Health endpoint `/api/v1/health`
- [ ] README includes setup and deploy steps

## 9) Immediate Next Action

Start a new codebase in a separate folder named `watchmatrix-platform` and migrate page-by-page while keeping this legacy project as reference.
