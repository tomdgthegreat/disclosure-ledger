# data/

Production storage is **Postgres** (Prisma). When `DATABASE_URL` is unset, the app
falls back to local `data/db.json` for development only — **not durable on Vercel**.

Do not commit `db.json` / `records.json` / `privacy-requests.json`.
