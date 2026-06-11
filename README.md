# Mosafa Mart - Full Stack Next.js E-commerce

Mosafa Mart এর ডিজাইন অনুযায়ী তৈরি full-stack e-commerce অ্যাপ।

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma** + **MongoDB**
- **Swiper** (Hero slider)

## Pages (মূল HTML ফোল্ডার ম্যাপিং)

| ফোল্ডার | পেজ | Route |
|---------|-----|-------|
| `mosafamart.home-page` | হোম | `/` |
| `mosafamart.cotagory-page` | ক্যাটাগরি | `/category/[slug]` |
| `mosafamart.product-page` | পণ্য বিবরণ | `/product/[slug]` |
| `mosafamart.checkout-page` | চেকআউট | `/checkout` |

## Setup

```bash
cd fullstack-nextjs
npm install
cp .env.example .env
# .env এ MongoDB DATABASE_URL সেট করুন
npm run db:push
npm run db:seed
npm run dev
```

MongoDB ছাড়াও অ্যাপ চলবে — static seed data fallback আছে।

## Design

- Primary color: `#fc8934` (orange)
- Font: Baloo Da 2 (Bengali)
- WhatsApp & Call floating buttons
- Same navigation categories as original site

## API Routes

- `GET /api/products` — পণ্য তালিকা
- `GET /api/categories` — ক্যাটাগরি তালিকা
- `POST /api/orders` — অর্ডার জমা
