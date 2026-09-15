# Disclosure Ledger

Greenfield Day-1 MVP: **self-reported** AI declaration + content-hash audit trail for publish-bound images (EU AI Act Art. 50 context — live 2 Aug 2026).

Built with **Next.js 14 + TypeScript + Tailwind**. Vercel-friendly scaffold.

> **Not a compliance product.** Declarations are self-reported and unverified. This app does not sign, verify, attest, or certify images, and does not claim legal adequacy under Art. 50 or any other law.

## What works (local)

1. **Landing** — honest problem framing, how it works, 3 free then ~$29/mo, hard non-claims.
2. **Create flow** (`/create`)
   - Client-side image drop
   - Browser SHA-256 of file bytes (Web Crypto)
   - Best-effort provenance marker scan (string/byte heuristics — **not** C2PA validation)
   - Self-reported AI declaration: yes / no / partial + notes
   - Optional contact email
   - Persist record to **JSON file DB** at `data/records.json`
3. **Public record** `/r/[id]` — hash, declaration, provenance summary, timestamp, unverified disclaimers on every page
4. **CSV export** — `/api/records/[id]/csv`
5. **Free tier** — first **3** records on the instance; 4th+ returns HTTP 402 soft-gate + Stripe Checkout stub
6. **Optional ops** — `/ops` + `/api/ops` with `OPS_PASSWORD`

## What is stubbed

- **Stripe Checkout** — `/api/checkout` returns a stub message until `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID` are set; even then Day-1 does not yet call the Stripe SDK (wire `checkout.sessions.create` next).
- **Image upload/storage** — MVP stores hash + metadata only; image bytes stay in the browser.
- **Auth / accounts** — email is optional metadata only.
- **Full C2PA** — heuristic scan only; no signature verification.

## Storage (local MVP)

| Item | Location |
|------|----------|
| Records | `data/records.json` (created on first write) |
| Images | Not stored server-side |

Documented choice for Day-1: **JSON file DB** (no Prisma required). Swap to SQLite/Postgres + object storage before production.

## Run locally

```bash
cd disclosure-ledger
cp .env.example .env.local   # optional
npm install
npm run dev
# open http://localhost:3000
```

```bash
npm run build   # must pass
npm start
```

## Environment variables

See `.env.example`:

| Var | Purpose |
|-----|---------|
| `STRIPE_SECRET_KEY` | Stripe secret (Checkout) |
| `STRIPE_PRICE_ID` | Price id for ~$29/mo |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Future client use |
| `OPS_PASSWORD` | Gate `/ops` + `/api/ops` |
| `NEXT_PUBLIC_APP_URL` | Public base URL |

## What is NOT claimed (copy rules)

- No compliance, signing, verification, or legal adequacy claims in UI.
- Every public record states declarations are **self-reported and unverified**.
- Provenance scan is best-effort and may miss or mis-hint markers.

## Production blockers

1. **Domain** — pick and DNS for the public product.
2. **Stripe** — live keys, Price ($29/mo), Checkout Session + webhook to unlock paid tier (replace instance-wide free counter with per-customer entitlements).
3. **Durable DB / storage** — replace `data/records.json` (ephemeral on many hosts) with Postgres/SQLite on persistent volume; decide whether to store images.
4. **GitHub repo** — create `tomdgthegreat/disclosure-ledger` when ready; this local repo is initialized but **not pushed**.
5. **Hosting** — Vercel (or similar) with durable storage story; file DB will not survive serverless without external store.
6. **Legal review** — counsel for Art. 50 positioning; product remains declaration/audit trail only.


## Locales (i18n)

Uses **next-intl** with `localePrefix: "as-needed"`:

| Locale | URL prefix |
|--------|------------|
| English (`en`, default) | none — `/`, `/pricing`, `/art-50`, `/how-it-works`, `/create`, `/r/[id]` |
| German (`de`) | `/de/...` |
| French (`fr`) | `/fr/...` |
| Italian (`it`) | `/it/...` |
| Spanish (`es`) | `/es/...` |
| Polish (`pl`) | `/pl/...` |

Marketing pages are indexable with hreflang + sitemap. Public records `/r/[id]` (and locale-prefixed equivalents) are **noindex**. Message catalogs live in `src/messages/{locale}.json`.

## Hard isolation

This project is **greenfield**. Do not remix Bytewitness / pngify.pro engines. Do not couple to DealClear / WinRoom.

## License

Private / unpublished MVP unless Tom opens the GitHub repo.
