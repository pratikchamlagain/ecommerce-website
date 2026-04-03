# Legacy Static Site Reference

This file preserves key details from the original HTML/CSS/JavaScript WatchMatrix build before removing the old folder structure.

## Legacy Pages

- index/home page: hero and entry navigation
- products page: watch listing and product cards
- category page: category-focused product filtering
- cart page: localStorage-based cart and quantity controls
- checkout page: static checkout journey
- about/research/blog/portfolio subpages
- men/women/kids/luxury themed segments and brand-specific sections

## Legacy Assets and Behavior

- Local image assets in folders like images, kids, womens, omega, titan_img, rolex
- CSS split between root style.css and Css/* files
- JavaScript split between root script.js and javascript/* files
- Cart persistence done with browser localStorage
- Multiple static route files (blog_files/* and research pages)

## What Must Be Preserved In React Migration

- Product domains: Men, Women, Kids, Luxury
- Main watch brands already represented in seed data:
  - Titan
  - Fastrack
  - Casio
  - Rolex
  - Omega
  - Sonata
- Core user flow:
  - Browse products
  - View categories
  - Add to cart
  - Checkout
  - Authentication and profile
- Professional visual goals:
  - Premium look and clear hierarchy
  - Mobile-first responsive layout
  - Consistent design tokens and spacing

## Migration Note

The legacy static source was intentionally removed from the root workspace after this snapshot so development can focus entirely on:

- watchmatrix-platform/frontend (React + Tailwind)
- watchmatrix-platform/backend (Node + Prisma + PostgreSQL)
