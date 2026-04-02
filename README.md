# WatchMatrix E-commerce Website

Frontend e-commerce project built with HTML, CSS, and JavaScript.

## Features

- Product listing and category pages
- Search/sort-ready product rendering
- LocalStorage cart persistence
- Quantity controls in cart (+/-)
- Remove single item and clear cart
- Automatic subtotal, shipping, and total calculation
- Checkout page with form validation and order summary
- Buy Now flow that adds product and redirects to cart
- Responsive shared header/footer styles

## Project Structure

- `home.html`: main landing page
- `products.html`: full product listing and sorting
- `category.html`: category-based listing
- `cart.html`: cart management page
- `checkout.html`: checkout flow
- `index.html`: about section and team content
- `research.html`, `blog.html`, `blog_files/`: supporting pages
- `Css/`: shared and page-level styles
- `javascript/`: all client logic

## Run Locally

1. Open this folder in VS Code.
2. Use Live Server extension, or open `home.html` directly in a browser.

## Deployment (GitHub Pages)

1. Push project to a GitHub repository.
2. In repository settings, open **Pages**.
3. Set source to **Deploy from branch**.
4. Choose `main` (or your default branch) and root folder `/`.
5. Save and wait for the Pages URL.

## Notes

- Paths use root-style references (`/Css/...`, `/javascript/...`). If deploying to a subpath, convert them to relative paths.

## React + Node.js Upgrade Path

Full migration blueprint is available here:

- `docs/react-node-migration-plan.md`

Quick start commands (run in a new folder, not in this legacy folder):

```bash
mkdir watchmatrix-platform
cd watchmatrix-platform

# Frontend
npm create vite@latest apps/web -- --template react

# Backend
mkdir -p apps/api
cd apps/api
npm init -y
npm install express cors dotenv zod jsonwebtoken bcryptjs prisma @prisma/client
npm install -D nodemon
npx prisma init
```
