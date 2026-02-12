# Project Tutorial (Explained Like You’re in 5th Grade 😊)

Hi! This file will walk you through:

- **What this project is**
- **What pieces it has** (backend, frontend, database, Redis, etc.)
- **What I changed and why**
- **How to run it step by step**
- **How things work together** (login, organizations, boards, analytics)

I’ll keep the language simple, but still correct.

---

## 1. Big Picture: What is this project?

Imagine a website like **Trello** or **Asana**:

- You **log in**.
- You have **organizations** (like teams or companies).
- Inside an organization you have:
  - **Projects**
  - **Boards** (Kanban boards with columns and cards)
  - **Tasks** (cards you move between columns)
- You also see an **analytics dashboard** (graphs and numbers showing how many tasks you made, finished, etc.).

This project gives you:

- A **backend** (server) that talks to the database.
- A **frontend** (Next.js website) that you see in the browser.
- A **database** (PostgreSQL) to store everything.
- A **cache** (Redis) mainly for tokens and analytics caching (optional in dev).

---

## 2. Where the code lives

At the top level you have:

- `backend/` → The **server** (Node.js + Express + TypeScript + Prisma).
- `frontend/` → The **website** (Next.js 14 + React + Tailwind CSS).
- `docker-compose.yml` → A file to start Postgres, Redis, and backend with one command.
- `README.md` → Short overview.
- `USAGE.md` → More detailed “how to use” guide.
- `tutorial.md` → This file (big friendly explanation).

Think of:

- `backend/` = the **brain** (logic and data).
- `frontend/` = the **face** (what the user sees).

---

## 3. What the backend does (in simple words)

The backend:

- Listens on **port 4000** (`http://localhost:4000`).
- Knows how to:
  - Register and log in users.
  - Create and list organizations.
  - Create demo data (project, board, columns, tasks).
  - Serve analytics (like “how many tasks?”, “how many done?”).
  - Handle file uploads (to S3, if you configure it).
  - Talk to Stripe (for billing) if you configure Stripe keys.

### 3.1. Tech inside backend

Inside `backend/` we use:

- **Express** → tiny web server.
- **Prisma** → talks to PostgreSQL for you.
- **Redis** → helps with:
  - Caching analytics.
  - Storing refresh tokens and blacklists.
- **JWT (JSON Web Tokens)**:
  - Frontend gets an **access token** (short-lived).
  - Refresh token is stored in cookies & Redis.

---

## 4. What the frontend does (in simple words)

The frontend:

- Runs on **port 3000** (`http://localhost:3000`).
- Built with **Next.js 14** (React framework).
- Uses:
  - **Zustand** → a tiny state store for user/org/board state.
  - **Axios** → to call the backend HTTP API.
  - **Socket.io client** → for real-time stuff (ready for later).
  - **dnd-kit** → for drag and drop on the Kanban board.
  - **Tailwind CSS** → for styling.

Pages:

- `/login` → Log in page.
- `/register` → Sign up page.
- `/dashboard` → Analytics dashboard.
- `/boards/[boardId]` → Kanban board page (e.g. `/boards/demo`).
- `/billing` → Billing page (Stripe).
- `/` → Smart home page that redirects:
  - If logged in → `/dashboard`
  - If not → `/login`

---

## 5. Environment variables (secret settings)

Programs need to know “where is the database?” and “what is the secret key?”.  
We store this in **.env** files.

### 5.1 Backend `.env`

Path: `backend/.env`

Important ones:

- `DATABASE_URL` → how to reach Postgres.
  - Example for Docker: `postgresql://user:password@db:5432/pm_saas`
  - Example for local: `postgresql://user:password@localhost:5432/pm_saas`
- `REDIS_URL` → how to reach Redis.
  - Example for Docker: `redis://redis:6379`
  - Example for local: `redis://localhost:6379`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` → long random strings (for tokens).
- `STRIPE_*` → Stripe keys (if you want billing to truly work).
- `AWS_*` → S3 config (if you want real file uploads).

### 5.2 Frontend `.env.local`

Path: `frontend/.env.local`

Important:

- `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` (if using Stripe).

---

## 6. Fixes and improvements I made (step by step)

Here’s a summary of the important fixes and why I did them.

### 6.1 TypeScript & backend dev server

Problem:

- `npm run dev` in `backend/` kept crashing because TypeScript didn’t like some imports and types (like `req.user`).

What I did:

- Updated `backend/tsconfig.json`:
  - Enabled `esModuleInterop`, `strict`, `skipLibCheck`, correct `moduleResolution`, etc.
- Fixed type problems by casting:
  - Used `(req as any).user` and `(req as any).authContext` in controllers and middleware so TypeScript doesn’t block running your code.

Result:

- `npm run dev` can run and restart on file changes without TypeScript errors.

### 6.2 Redis errors (server crashing if Redis not running)

Problem:

- Backend crashed on startup if Redis was not running:
  - `Error: connect EPERM ::1:6379`

What I did:

- In `src/config/redis.ts`:
  - Made `initRedis()` **catch errors** in development:
    - In **dev**, if Redis is down → log error and continue.
    - In **production**, still throw (Redis is required).
- In `token.store.ts` and `cache.service.ts`:
  - Wrapped Redis calls in `try/catch`.
  - If Redis is not available:
    - Token blacklist and cache simply **do nothing** instead of crashing the app.

Result:

- You can run the backend **even without Redis** in dev.
- If you run Redis, things like token rotation & analytics cache will work.

### 6.3 CORS and cookies (the “registration failed” problem)

Problem:

- Sign‑up appeared to “fail”, but the real cause was:
  - CORS blocked cookies.
  - So the browser didn’t store the JWT cookies.
  - Then `/auth/me` returned 401 and `/auth/refresh` 500.

What I did:

- In `backend/src/app.ts`:

  ```ts
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  ```

- In frontend `axiosClient`:
  - Already had `withCredentials: true`, which is correct.
- In the register page:
  - Surfaced **real error messages** instead of “Registration failed”.

Result:

- Browser accepts cookies from backend.
- `/auth/register` + `/auth/me` work correctly.
- You stay logged in and get redirected to `/dashboard`.

### 6.4 Real `/dashboard` route instead of 404

Problem:

- Going to `/dashboard` showed **404**, because:
  - `(dashboard)/page.tsx` route group made a page at `/`, not `/dashboard`.

What I did:

- Added `src/app/(dashboard)/dashboard/page.tsx`:
  - This is now a **real `/dashboard` page**.
  - It shows the analytics dashboard.

Result:

- `/dashboard` works and shows KPIs + charts.

### 6.5 Organization support and demo data

Problem:

- Analytics and boards depend on an **organization**.
- At first, there was no easy way for a brand new user to create one with data.

What I did:

- **Backend**:
  - Added `POST /api/v1/organizations`:
    - If `demo: true`:
      - Creates:
        - Demo organization.
        - Membership as OWNER.
        - Demo project, board, columns (`To Do`, `In Progress`, `Done`).
        - Demo tasks (TODO, IN_PROGRESS, DONE).
- **Frontend**:
  - In dashboard page:
    - When there is **no organization**:
      - Show a button **“Create demo organization”**.
      - On click:
        - Call backend to create demo org.
        - Refresh org list and set `currentOrg`.
      - Then analytics loads and **you see real numbers**.

Result:

- After logging in, you can create a full demo org and see:
  - Boards
  - Tasks
  - Analytics with data

---

## 7. How to run everything (step by step)

### 7.1 Using Docker Compose (easier all‑in‑one)

From the project root:

```bash
cd /Users/shivangnayar/chinmay
docker compose up -d --build
```

This will:

- Start **Postgres** (`db`).
- Start **Redis** (`redis`).
- Build and start **backend**.

Then run frontend:

```bash
cd frontend
npm run dev    # or npm start if you want prod mode
```

Open:

- Backend health: `http://localhost:4000/health`
- Frontend: `http://localhost:3000`

### 7.2 Running without Docker (local dev)

1. Start **Postgres** (e.g. via Docker or local install).
2. Start **Redis** (optional but nice).
3. Backend:

   ```bash
   cd backend
   npm install
   npx prisma migrate dev   # first time to set up tables
   npm run dev
   ```

4. Frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Visit:
   - `http://localhost:3000/register` → sign up.
   - After login, you’ll be redirected to `/dashboard`.
   - Click **“Create demo organization”** → see analytics.

---

## 8. How to see the database (like peeking inside)

### 8.1 Prisma Studio (recommended)

From `backend/`:

```bash
cd backend
npx prisma studio
```

- Opens `http://localhost:5555` in your browser.
- You can click on:
  - `User`
  - `Organization`
  - `Membership`
  - `Project`, `Board`, `Column`, `Task`
  - etc.

You’ll see the same demo data that powers your dashboard and board.

### 8.2 psql (command line)

If using Docker Compose:

```bash
docker exec -it pm_saas_db psql -U user -d pm_saas
```

Then run SQL like:

```sql
\dt;
SELECT * FROM "Organization";
SELECT * FROM "Project";
SELECT * FROM "Task" LIMIT 10;
```

---

## 9. Mental model (how it all works together)

Picture it like this:

- **Frontend (Next.js)** is the **face**:
  - Shows pages: login, register, dashboard, boards, billing.
  - Talks to backend through Axios calls.

- **Backend (Express)** is the **brain**:
  - Knows how to respond to requests like:
    - `/auth/register`
    - `/organizations`
    - `/analytics/dashboard`
    - `/boards/:boardId`
  - Talks to:
    - **Postgres** (for saving data).
    - **Redis** (for tokens/cache, optional in dev).

- **Database (Postgres)** is the **memory**:
  - Remembers users, orgs, projects, tasks, etc.

- **Redis** is like a **whiteboard**:
  - Holds temporary stuff (tokens, caches).

When you:

1. **Register**:
   - Frontend sends your name/email/password to backend.
   - Backend saves a new `User` in Postgres.
   - Backend gives you cookies + access token.

2. **Create demo organization**:
   - Frontend calls `POST /organizations` with `demo: true`.
   - Backend creates org, project, board, columns, tasks in DB.
   - Frontend sets this org as your current org.

3. **Open dashboard**:
   - Frontend calls `/analytics/dashboard` with `x-org-id`.
   - Backend counts tasks and returns stats.
   - Frontend shows cards and charts.

That’s it: you now have a full little SaaS system running on your machine.

If you ever feel lost, just:

1. Re‑read sections 7 and 8 (how to run + how to see data).
2. Use Prisma Studio to look at the “world behind the scenes”.

You’re no longer just clicking around — you’re running a mini production‑grade app. 🎉

