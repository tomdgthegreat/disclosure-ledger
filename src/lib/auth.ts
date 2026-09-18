/**
 * Magic-link session helpers for Disclosure Ledger.
 * Signed httpOnly cookie proves a verified inbox. No passwords.
 *
 * Env: AUTH_SECRET or SESSION_SECRET (either works; AUTH_SECRET preferred).
 * If neither is set, session create/verify fails clearly (logged + caller gets null / error).
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const t = email.trim().toLowerCase();
  if (!t || !t.includes("@") || t.length < 3) return null;
  return t.slice(0, 320);
}

export const SESSION_COOKIE = "dl_session";
export const MAGIC_TOKEN_TTL_MS = 20 * 60 * 1000; // 20 minutes
export const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60; // 30 days
export const MAGIC_REQUEST_COOLDOWN_MS = 60 * 1000; // 1 / email / 60s

export type SessionPayload = {
  email: string;
  exp: number; // unix seconds
};

function getAuthSecret(): string | null {
  const secret =
    process.env.AUTH_SECRET?.trim() || process.env.SESSION_SECRET?.trim();
  return secret || null;
}

export function isAuthSecretConfigured(): boolean {
  return Boolean(getAuthSecret());
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function generateMagicToken(): string {
  return randomBytes(32).toString("base64url");
}

function b64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
}

function sign(payloadB64: string, secret: string): string {
  return b64url(createHmac("sha256", secret).update(payloadB64).digest());
}

export function createSessionValue(email: string, maxAgeSec = SESSION_MAX_AGE_SEC): string | null {
  const secret = getAuthSecret();
  if (!secret) {
    console.error(
      "[disclosure-ledger] AUTH_SECRET / SESSION_SECRET unset — cannot create session cookie"
    );
    return null;
  }
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const payload: SessionPayload = {
    email: normalized,
    exp: Math.floor(Date.now() / 1000) + maxAgeSec,
  };
  const payloadB64 = b64url(JSON.stringify(payload));
  const sig = sign(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

export function parseSessionValue(value: string | undefined | null): SessionPayload | null {
  if (!value) return null;
  const secret = getAuthSecret();
  if (!secret) return null;
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return null;
  const expected = sign(payloadB64, secret);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const json = fromB64url(payloadB64).toString("utf8");
    const payload = JSON.parse(json) as SessionPayload;
    if (!payload?.email || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    const email = normalizeEmail(payload.email);
    if (!email) return null;
    return { email, exp: payload.exp };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSec = SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

/** Read verified session email from Next.js cookies() (Server Components / Route Handlers). */
export function getSessionEmail(): string | null {
  try {
    const jar = cookies();
    const raw = jar.get(SESSION_COOKIE)?.value;
    return parseSessionValue(raw)?.email ?? null;
  } catch {
    return null;
  }
}

/** Read session from an incoming request (Route Handlers). */
export function getSessionEmailFromRequest(req: NextRequest): string | null {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  return parseSessionValue(raw)?.email ?? null;
}

export function applySessionCookie(
  res: NextResponse,
  email: string
): NextResponse {
  const value = createSessionValue(email);
  if (!value) return res;
  res.cookies.set(SESSION_COOKIE, value, sessionCookieOptions());
  return res;
}

export function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(0),
    maxAge: 0,
  });
  return res;
}

/**
 * Resolve email for gated actions: verified session required.
 * Prefer session email; if body email differs, ignore body and use session.
 */
export function resolveGatedEmail(
  req: NextRequest,
  bodyEmail?: string | null
):
  | { ok: true; email: string }
  | { ok: false; code: "auth_required" | "auth_misconfigured"; message: string } {
  if (!isAuthSecretConfigured()) {
    return {
      ok: false,
      code: "auth_misconfigured",
      message:
        "Server auth is not configured (set AUTH_SECRET or SESSION_SECRET). Magic-link sign-in is required for this action.",
    };
  }
  const sessionEmail = getSessionEmailFromRequest(req);
  if (!sessionEmail) {
    return {
      ok: false,
      code: "auth_required",
      message:
        "Verify your email with a magic link first. Request a link at /login.",
    };
  }
  const body = normalizeEmail(bodyEmail);
  // Prefer session; ignore mismatched body email.
  if (body && body !== sessionEmail) {
    console.warn(
      "[disclosure-ledger] body email differs from session — using session email"
    );
  }
  return { ok: true, email: sessionEmail };
}

export function truncateEmail(email: string, max = 28): string {
  if (email.length <= max) return email;
  const [local, domain] = email.split("@");
  if (!domain) return email.slice(0, max - 1) + "…";
  const keep = Math.max(3, max - domain.length - 2);
  return `${local.slice(0, keep)}…@${domain}`;
}
