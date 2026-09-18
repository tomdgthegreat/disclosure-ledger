import { NextRequest, NextResponse } from "next/server";
import { isAuthSecretConfigured } from "@/lib/auth";
import { createMagicLinkToken, normalizeEmail } from "@/lib/db";
import { sendMagicLinkEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/seo";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

function deliveryMessage(sent: boolean, reason?: string): string {
  if (sent) return "Check your email for a one-time sign-in link.";
  if (reason === "not_configured") {
    return "Email delivery is not configured. Ask the operator to set RESEND_API_KEY on Vercel and verify discloseledger.com in Resend.";
  }
  if (reason === "provider_error") {
    return "Could not deliver the sign-in email. Ask the operator to verify discloseledger.com in Resend (or set RESEND_FROM to a verified sender) and check Vercel runtime logs for Resend errors.";
  }
  return "Could not deliver the sign-in email. Try again shortly, or contact the operator.";
}

export async function POST(req: NextRequest) {
  if (!isAuthSecretConfigured()) {
    return NextResponse.json(
      {
        error: "auth_misconfigured",
        message:
          "Server is missing AUTH_SECRET or SESSION_SECRET. Magic-link sign-in cannot issue sessions.",
      },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    locale?: string;
  };
  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json(
      {
        error: "email_required",
        message: "A valid email address is required.",
      },
      { status: 400 }
    );
  }

  const localeRaw = String(body.locale || "en").toLowerCase();
  const locale = routing.locales.includes(
    localeRaw as (typeof routing.locales)[number]
  )
    ? localeRaw
    : routing.defaultLocale;

  const created = await createMagicLinkToken(email);
  if (!created.ok) {
    if (created.reason === "rate_limited") {
      return NextResponse.json(
        {
          error: "rate_limited",
          message:
            "Please wait about a minute before requesting another magic link for this email.",
          retryAfterMs: created.retryAfterMs,
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "email_required", message: "A valid email address is required." },
      { status: 400 }
    );
  }

  const base = getSiteUrl();
  // Locale-agnostic verify under /api; redirect carries locale via query.
  const url = `${base}/api/auth/magic/verify?token=${encodeURIComponent(created.token)}&locale=${encodeURIComponent(locale)}`;

  const result = await sendMagicLinkEmail({ to: email, url });
  const sent = result.ok;
  const reason = result.ok ? undefined : result.reason;

  if (!sent) {
    console.warn(
      "[disclosure-ledger] magic-link email not sent:",
      reason ?? "unknown",
      `| to_domain=${email.split("@")[1] ?? "?"}`
    );
  }

  // Keep a stable public shape. `reason` is a coarse ops hint only
  // (not_configured | provider_error | invalid_input) — no Resend internals.
  return NextResponse.json({
    ok: true,
    email,
    sent,
    ...(reason ? { reason } : {}),
    message: deliveryMessage(sent, reason),
  });
}
