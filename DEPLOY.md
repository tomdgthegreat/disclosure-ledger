# Deploy Disclosure Ledger (Vercel)

**Canonical production URL:** `https://discloseledger.com` (apex)  
**www:** redirect to apex — do not use www as canonical.

Repo: `tomdgthegreat/disclosure-ledger` → `origin/main`.

## 1. Connect GitHub to Vercel

1. In [Vercel](https://vercel.com), **Add New Project** → import `tomdgthegreat/disclosure-ledger`.
2. Framework preset: **Next.js** (auto-detected).
3. Root directory: repo root (default).
4. Build: `npm run build` / Output: Next.js default.
5. Deploy from branch **`main`**.

## 2. Environment variables

In the Vercel project → **Settings → Environment Variables** (Production at minimum):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://discloseledger.com` |
| `DATABASE_URL` | Neon / Vercel Postgres connection string (prefer EU) |
| `STRIPE_SECRET_KEY` | Live or test secret (operator sets; do not invent) |
| `STRIPE_PRICE_ID` | `price_1UG5ICJA3LJpXY1w7S3MbOid` (€29/mo EUR recurring) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard → Webhooks → signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional Day-1 |
| `OPS_PASSWORD` | Optional; gates `/ops` |
| `RESEND_API_KEY` | Resend API key (operator sets; do not invent) |
| `RESEND_FROM` | Default `Disclosure Ledger <hello@discloseledger.com>` |

Redeploy after changing env vars so `NEXT_PUBLIC_*` is baked into the client/SEO build.

After first deploy with `DATABASE_URL`, run migrations once (Vercel build does `prisma generate`; apply schema with `npx prisma migrate deploy` against production `DATABASE_URL`, or use Vercel Postgres / Neon migrate flow).

### Stripe webhook

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://discloseledger.com/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET`


### Resend (transactional email)

1. Create a Resend account and API key → set `RESEND_API_KEY` on Vercel (never commit).
2. **Tom must verify `discloseledger.com` in Resend** (Domains → Add → DNS records Resend shows).
3. Until the domain is verified, sending from `hello@discloseledger.com` will fail — use Resend’s onboarding / test domain temporarily, or set `RESEND_FROM` to that verified sender.
4. Default from: `Disclosure Ledger <hello@discloseledger.com>` via `RESEND_FROM`.
5. If `RESEND_API_KEY` is unset, privacy/checkout email helpers **no-op** (log warning only) and never break create/checkout.

## 3. Add domains

1. Vercel project → **Settings → Domains**.
2. Add **`discloseledger.com`** and **`www.discloseledger.com`**.
3. Prefer **Redirect `www` → `discloseledger.com`** (apex = primary / canonical).
4. Follow Vercel’s DNS instructions for your registrar (do not change DNS from this repo).

### DNS records (typical for Vercel)

| Host | Type | Value |
|------|------|--------|
| `@` / apex | **A** | `76.76.21.21` |
| `www` | **CNAME** | `cname.vercel-dns.com` |

Exact targets can vary by Vercel account; use the values shown in the Domains UI if they differ.

After DNS propagates, confirm:

- `https://discloseledger.com` serves the app
- `https://www.discloseledger.com` redirects to the apex
- Sitemap / OG / hreflang / Stripe success-cancel use `https://discloseledger.com` via `NEXT_PUBLIC_APP_URL`

## Region & data residency (recommended)

- Prefer **Vercel region Frankfurt (`fra1`) / EU** for the production deployment so EU visitors hit nearby edge/compute where possible.
- Provision **Postgres in the EU** (Neon `eu-central-1` or Vercel Postgres `fra1`) via `DATABASE_URL`. Without it, the app logs a loud warning and falls back to local JSON (not durable on serverless).
- Operator contact for privacy / legal: **hello@discloseledger.com** (Atlas AG LLC, Melba, ID 83641, United States).
- Ship legal pages: `/privacy`, `/terms`, `/legal`, `/cookies` (localized).

## 4. Post-deploy checks

```bash
npm run build   # locally before push
```

- Open `/`, `/pricing`, `/privacy`, `/terms`, `/legal`, `/cookies`, `/sitemap.xml`, `/robots.txt`
- Spot-check a locale (e.g. `/de`) and hreflang/canonical pointing at apex
- Create flow requires contact email; free tier is **3 records per email**; paid entitlement unlocks unlimited for that email
- Stripe Checkout success/cancel return to `/create?checkout=…`

## Out of scope here

- Buying the domain or editing registrar DNS (Tom / ops only)
- Inventing Stripe secret keys (operator only)

## Still needed from Tom / Businessbot

1. Set `DATABASE_URL` on Vercel (Neon EU `eu-central-1` or Vercel Postgres `fra1`)
2. Set `STRIPE_SECRET_KEY` from Businessbot secure `.env.local` (never commit)
3. Create Stripe webhook → set `STRIPE_WEBHOOK_SECRET`
4. Confirm `STRIPE_PRICE_ID=price_1UG5ICJA3LJpXY1w7S3MbOid` on Vercel
5. Run `npx prisma migrate deploy` against production DB
6. www may be primary on Vercel short-term — redirect www → apex when convenient (do not block)
7. Verify **discloseledger.com** in Resend and set `RESEND_API_KEY` / `RESEND_FROM` on Vercel
