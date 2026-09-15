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
| `STRIPE_SECRET_KEY` | (live or test secret when ready) |
| `STRIPE_PRICE_ID` | (Price id for €29/mo (EUR recurring)) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (optional Day-1) |
| `OPS_PASSWORD` | (optional; gates `/ops`) |

Redeploy after changing env vars so `NEXT_PUBLIC_*` is baked into the client/SEO build.

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

## 4. Post-deploy checks

```bash
npm run build   # locally before push
```

- Open `/`, `/pricing`, `/sitemap.xml`, `/robots.txt`
- Spot-check a locale (e.g. `/de`) and hreflang/canonical pointing at apex
- Remember: local `data/records.json` is **not** durable on serverless — plan Postgres (or similar) before relying on production writes

## Out of scope here

- Buying the domain or editing registrar DNS (Tom / ops only)
- Live Stripe webhook + entitlements wiring
