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
| `AUTH_SECRET` | Long random secret for signed session cookies (or `SESSION_SECRET`) |

Redeploy after changing env vars so `NEXT_PUBLIC_*` is baked into the client/SEO build.

After first deploy with `DATABASE_URL`, run migrations once (Vercel build does `prisma generate`; apply schema with `npx prisma migrate deploy` against production `DATABASE_URL`, or use Vercel Postgres / Neon migrate flow).

### Stripe webhook

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://discloseledger.com/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET`


### Resend (transactional email)

Magic-link `POST /api/auth/magic/request` returns `{ ok: true, sent: false }` when Resend cannot deliver. `AUTH_SECRET` being set (no 503) does **not** imply email works.

#### Operator checklist (Tom) — do in order

1. **Resend account** → [resend.com](https://resend.com) → create API key (Sending access).
2. **Vercel → Project → Settings → Environment Variables → Production**
   - `RESEND_API_KEY` = the Resend key (never commit; do not invent values in git).
   - `RESEND_FROM` = `Disclosure Ledger <hello@discloseledger.com>`  
     Format must be either `email@domain` or `Display Name <email@domain>` (Resend rejects other shapes).
3. **Verify domain in Resend** (required to send to arbitrary recipients):
   - Resend → **Domains → Add** → `discloseledger.com`
   - Add the DNS records Resend shows (SPF / DKIM; optionally DMARC) at the registrar
   - Wait until status is **Verified**
4. **Until the domain is verified**, sending from `hello@discloseledger.com` **fails** (Resend 403 / validation_error). Temporary workaround:
   - Set `RESEND_FROM` to Resend’s onboarding address (e.g. `Disclosure Ledger <onboarding@resend.dev>`) **and** only test to the Resend account owner’s inbox, **or**
   - Verify a subdomain you control and set `RESEND_FROM` to an address on that verified domain.
5. **Redeploy** Production after adding/changing env vars (Vercel → Deployments → Redeploy, or push an empty commit). Env changes do not apply to the live deployment until redeploy.
6. **Smoke test**
   ```bash
   curl -sS -X POST 'https://www.discloseledger.com/api/auth/magic/request' \
     -H 'content-type: application/json' \
     -d '{"email":"YOUR_REAL_INBOX@example.com","locale":"en"}'
   ```
   Expect `"sent": true`. If `"sent": false`:
   - `"reason":"not_configured"` → `RESEND_API_KEY` missing on Production
   - `"reason":"provider_error"` → open Vercel → Runtime Logs; search `Resend send failed` (domain not verified / FROM mismatch / bad key are the usual causes). Also check Resend → Logs.
7. If `RESEND_API_KEY` is unset, privacy/checkout/magic email helpers **no-op** (server warning only) and never throw into create/checkout.

Default from (code + docs): `Disclosure Ledger <hello@discloseledger.com>`.

### Magic-link auth (session)

1. Set **`AUTH_SECRET`** (preferred) or **`SESSION_SECRET`** to a long random value (`openssl rand -base64 32`). Required to issue/verify the `dl_session` httpOnly cookie.
2. Cookie: `Secure` (production), `HttpOnly`, `SameSite=Lax`, `path=/`, max-age ~30 days. Payload: verified email + expiry, HMAC-signed.
3. Flow: `/login` → `POST /api/auth/magic/request` → Resend email → `GET /api/auth/magic/verify?token=…` sets cookie → redirect to `/{locale}/login?verified=1`.
4. Tokens: Prisma `MagicLinkToken` (sha256 hash only, ~20 min TTL, single-use). If `DATABASE_URL` is unset, hashed tokens fall back to `data/db.json` (same caveat as entitlements — not durable on Vercel).
5. Rate limit: ~1 magic-link request per email per 60 seconds.
6. Gated without verified session (HTTP 401 `auth_required`): `POST /api/records`, `POST /api/checkout`, `POST /api/scan`. UI should send users to `/login`.
7. Logout: `GET` or `POST /api/auth/logout` clears the cookie.
8. No passwords. No Twilio.


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
8. Set `AUTH_SECRET` (or `SESSION_SECRET`) on Vercel for magic-link sessions
9. Run `npx prisma migrate deploy` so `magic_link_tokens` exists in production
