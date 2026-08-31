# Shivaprasad Tiwari — Animated Portfolio

Full stack portfolio with a Three.js animated frontend, a NestJS + PostgreSQL backend, a blog engine, and an admin panel to manage everything.

## Structure

| Folder      | Stack                                              | Runs on |
| ----------- | -------------------------------------------------- | ------- |
| `frontend/` | Next.js 16, React 19, Tailwind 4, Three.js (R3F), framer-motion | :3000   |
| `backend/`  | NestJS, TypeORM, PostgreSQL, JWT auth              | :4000   |

## Running locally

Prerequisites: Node 22+, PostgreSQL running on `localhost:5432` with a `portfolio` database (`psql -U postgres -c "CREATE DATABASE portfolio;"`).

```bash
# Terminal 1 — backend API
cd backend
npm install
npm run start:dev        # http://localhost:4000/api

# Terminal 2 — frontend
cd frontend
npm install
npm run dev              # http://localhost:3000
```

On first boot the backend auto-creates tables (`synchronize: true`) and seeds:

- the admin user (from `backend/.env` → `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- your profile, experience (ePrabhidi, ASI Tech), skills, sample projects, and one sample blog post

## Admin panel

- URL: `http://localhost:3000/admin`
- Default login: `admin@shivaprasad.dev` / `Admin@123` — **change both in `backend/.env` before deploying** (delete the user row or use a fresh DB for the new values to seed).

From the admin panel you can edit your profile/socials, manage experience, projects, and skills, write and publish blog posts (Markdown), and read contact-form messages.

## API overview

Public: `GET /api/profile`, `/experiences`, `/projects`, `/skills`, `/blogs`, `/blogs/slug/:slug`, `POST /api/messages`.
Admin (JWT via `POST /api/auth/login`): all create/update/delete routes, `GET /api/blogs/all`, `GET /api/messages`.

## Deploying

Both apps live in one repo. Vercel and Render each build only their own subfolder via a **Root Directory** setting — no repo splitting needed.

1. **Database** — create a free PostgreSQL instance (Neon, Supabase, or Railway) and copy its credentials.

2. **Backend → Render** — New Web Service, point it at this repo:

   | Setting | Value |
   | --- | --- |
   | Root Directory | `backend` |
   | Build Command | `npm ci --include=dev && npm run build` |
   | Start Command | `npm run start:prod` |

   `--include=dev` is required because `@nestjs/cli` (which provides `nest build`) is a devDependency; without it a service with `NODE_ENV=production` fails with `nest: not found`.

   Add every var from `backend/.env.example` under Environment. Set `DATABASE_SSL=true` for a hosted DB, and `CORS_ORIGIN` to your Vercel URL.

   For the database you can either paste the provider's connection string as `DATABASE_URL` (simplest — it takes precedence and the five discrete `DATABASE_*` vars are ignored), or set `DATABASE_HOST` / `DATABASE_PORT` / `DATABASE_USER` / `DATABASE_PASSWORD` / `DATABASE_NAME` individually. Leaving all of them unset makes the app fall back to `localhost`, which on Render fails with `ECONNREFUSED 127.0.0.1:5432`.

   `CORS_ORIGIN` accepts a comma-separated list. Any `*.vercel.app` subdomain is also accepted automatically, so preview deploys work without reconfiguring the backend.

   Do **not** set `PORT` — Render injects it and the app already reads it. For production, consider switching `synchronize: false` + migrations once the schema is stable.

3. **Frontend → Vercel** — Import the repo:

   | Setting | Value |
   | --- | --- |
   | Root Directory | `frontend` |
   | Framework Preset | Next.js (auto-detected) |

   Add `NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com/api`.

4. **Close the loop** — once Vercel gives you a domain, set `CORS_ORIGIN` on Render to it and redeploy the backend.

## Environment files

Secrets are never committed. `.env` and `.env.local` are gitignored; only `backend/.env.example` (placeholders) is tracked.

| File | Committed | Purpose |
| --- | --- | --- |
| `backend/.env` | no | real local secrets |
| `backend/.env.example` | yes | template — copy to `.env` and fill in |
| `frontend/.env.local` | no | local `NEXT_PUBLIC_API_URL` |

In production these are set in the Render and Vercel dashboards, not in files.
