# Supabase (Postgres) – Option 1 Migration (Keep FastAPI)

This adds a toggle to use Supabase Postgres for auth (signup/login) while keeping FastAPI and the existing frontend.

## 1) Enable Supabase in backend

Set these env vars where your FastAPI runs:

```
USE_SUPABASE=1
SUPABASE_DB_URL=postgres://USER:PASSWORD@HOST:PORT/DB
JWT_SECRET=your-strong-secret
CORS_ORIGINS=*
ADMIN_EMAIL=you@example.com   # optional
```

Install deps and start backend:

```
pip install -r backend/requirements.txt
python backend/server.py
```

## 2) Create the users table in Supabase

Run in Supabase SQL editor:

```sql
-- Ensure pgcrypto for gen_random_uuid() (preferred on Supabase)
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  subscription_plan text not null default 'free',
  created_at timestamptz not null default now(),
  points int not null default 0,
  streak_days int not null default 0,
  last_login timestamptz,
  email_confirmed boolean not null default false,
  email_confirmation_token uuid,
  email_confirmation_sent_at timestamptz,
  is_admin boolean not null default false,
  password text not null
);

create unique index if not exists users_email_idx on public.users(email);
```

Notes:
- We use `pgcrypto` and `gen_random_uuid()` (works well on Supabase). If you prefer `uuid-ossp`, replace with `uuid_generate_v4()` and enable that extension.
- Password stores a bcrypt hash (same as Mongo path).

## 3) What changed in code

- `backend/server.py` has a new flag `USE_SUPABASE`. When enabled, auth endpoints use `backend/supabase_db.py` instead of Mongo.
- `backend/supabase_db.py` uses `asyncpg` and a small DAL.
- No frontend changes are required.

## 4) Rollout plan

1. Create the table with SQL above.
2. Set env vars (`USE_SUPABASE=1`, `SUPABASE_DB_URL=...`).
3. Restart backend and test signup/login.
4. Gradually migrate other features (expenses, budgets, etc.) later.

## 5) Troubleshooting

- SSL: Supabase requires SSL; the `postgres://` URL provided by Supabase works with asyncpg out-of-the-box.
- 500 on signup: Check `SUPABASE_DB_URL` and the table exists. Review backend logs.
- Admin: Set `ADMIN_EMAIL` to auto-bootstrap; or directly set `is_admin=true` in the table for a user.
