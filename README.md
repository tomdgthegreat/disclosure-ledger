# Disclosure Ledger

Greenfield MVP: **self-reported** AI declaration + content-hash audit trail for publish-bound images (EU AI Act Art. 50 context — live 2 Aug 2026).

Built with **Next.js 14 + TypeScript + Tailwind + Prisma (Postgres) + Stripe**. Vercel-friendly.

> **Not a compliance product.** Declarations are self-reported and unverified. This app does not sign, verify, attest, or certify images, and does not claim legal adequacy under Art. 50 or any other law.

## What works

1. **Landing** — honest problem framing, how it works, 3 free then €29/mo, hard non-claims.
2. **Create flow** (`/create`)
   - Client-side image drop
   - Browser SHA-256 of file bytes (Web Crypto)
   - Best-effort provenance marker scan (string/byte heuristics — **not** C2PA validation)
   - Self-reported AI declaration: yes / no / partial + notes
   - **Email required** for free-tier accounting
   - Persist record to **Postgres** (Prisma)
3. **Public record** `/r/[id]` — hash, declaration, provenance summary, timestamp, unverified disclaimers on every page
4. **CSV export** — `/api/records/[id]/csv`
5. **Free tier** — **3 records per customer/email** (not site-wide); 4th+ → HTTP 402 + Stripe Checkout
6. **Stripe** — Checkout Session (`mode: subscription`, EUR €29/mo) + webhook entitlements
7. **Optional ops** — `/ops` + `/api/ops` with `OPS_PASSWORD`

## Storage

| Item | Location |
|------|----------|
| Records + entitlements | **Postgres** via Prisma (`DATABASE_URL`) |
| Images | Not stored server-side |

**EU / Frankfurt preferred:** Neon `eu-central-1`, Vercel Postgres / Neon on **`fra1`**, or any EU-resident Postgres. Document region in your host’s dashboard.

## Stripe (€29/mo EUR)

| Piece | Detail |
|-------|--------|
| Price | `STRIPE_PRICE_ID` — documented default `price_1UG5ICJA3LJpXY1w7S3MbOid` (€29/mo EUR) |
| Checkout | `POST /api/checkout` → `stripe.checkout.sessions.create` (subscription, EUR price) |
| Webhook | `POST /api/stripe/webhook` — `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` → unlock/revoke paid tier |
| Secrets | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — **env only, never commit** |

Checkout stays behind `isStripeConfigured()` (needs secret key + price id). Empty secret → honest stub/503, no invented keys.

## Run locally

```bash
cd disclosure-ledger
cp .env.example .env.local
# Set DATABASE_URL (Postgres). Optionally copy STRIPE_SECRET_KEY from a secure store (never commit).
npm install
npx prisma migrate deploy   # or: npm run db:migrate
npm run dev
# open http://localhost:3000
```

```bash
npm run build   # runs prisma generate && next build
npm start
```

`npm run build` succeeds without a live DB if `prisma generate` has run (no queries at build time). **Runtime** create/list requires `DATABASE_URL` and migrated schema.

## Environment variables

See `.env.example`:

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | Postgres connection string (prefer EU/Frankfurt) |
| `STRIPE_SECRET_KEY` | Stripe secret — Vercel / `.env.local` only |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_PRICE_ID` | EUR €29/mo Price id (`price_1UG5ICJA3LJpXY1w7S3MbOid`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional client use |
| `OPS_PASSWORD` | Gate `/ops` + `/api/ops` |
| `NEXT_PUBLIC_APP_URL` | Public base URL — production: `https://discloseledger.com` |

## Production domain

**Canonical (apex):** `https://discloseledger.com`  
**www:** may be primary on Vercel for now; prefer redirect www → apex when convenient (do not block deploys).

Set `NEXT_PUBLIC_APP_URL=https://discloseledger.com`. See **DEPLOY.md**.

## What is NOT claimed (copy rules)

- No compliance, signing, verification, or legal adequacy claims in UI.
- Every public record states declarations are **self-reported and unverified**.
- Provenance scan is best-effort and may miss or mis-hint markers.

## EU / operator & legal

- **Operator:** Atlas AG LLC, Melba, ID 83641, United States
- **Contact:** hello@discloseledger.com
- **Legal pages:** `/privacy`, `/terms`, `/legal` (Impressum), `/cookies` (all locales)
- **Hosting:** Vercel Frankfurt (`fra1`) / EU + Postgres in the EU
- Public record CSV/JSON **omit `contactEmail`**; ops API can still export email when authenticated

## Locales (i18n)

Uses **next-intl** with `localePrefix: "as-needed"`: `en` (default), `de`, `fr`, `it`, `es`, `pl`.

## Hard isolation

This project is **greenfield**. Do not remix Bytewitness / pngify.pro engines. Do not couple to DealClear / WinRoom.

## License

Private / unpublished MVP unless Tom opens the GitHub repo.
