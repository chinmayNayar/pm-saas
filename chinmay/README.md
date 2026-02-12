# PM SaaS (Project Management)

Trello/Asana-style project management platform with Next.js 14 frontend and Node.js/Express backend.

## Quick start

### Backend

```bash
cd backend
cp .env.example .env   # Edit with your DATABASE_URL, REDIS_URL, JWT secrets, etc.
npm install
npx prisma generate
npx prisma migrate dev  # Creates DB tables
npm run dev             # http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # Set NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
npm install
npm run dev   # http://localhost:3000
```

- **Root** `/` redirects to `/login` or `/dashboard`.
- **Auth**: `/login`, `/register` (cookies + optional accessToken in response for Socket.io).
- **Dashboard**: `/dashboard` (analytics KPIs + charts; requires org).
- **Board**: `/boards/demo` (Kanban with drag-and-drop; uses demo data if board API 404s).
- **Billing**: `/billing` (Stripe checkout session).

### Environment

- **Backend**: See `backend/.env.example` (DB, Redis, JWT, Stripe, Google OAuth, S3, cookies).
- **Frontend**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

## Implemented

- **Backend**: Express + Prisma + PostgreSQL + Redis, JWT auth (access/refresh, cookies), Google OAuth, orgs & memberships, boards/columns/tasks, notifications, file uploads (S3 signed URLs), Stripe billing & webhooks, analytics (cached), Socket.io (Redis adapter).
- **Frontend**: Next.js 14 App Router, Tailwind, Zustand, Axios, Socket.io client, dnd-kit Kanban, protected dashboard, org switcher, analytics dashboard, Stripe checkout.
