import { NextRequest, NextResponse } from "next/server";
import { isAuthSecretConfigured } from "@/lib/auth";
import { createMagicLinkToken, normalizeEmail } from "@/lib/db";
import { sendMagicLinkEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/seo";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

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

  const sent = await sendMagicLinkEmail({ to: email, url });

  // Always return the same shape so we do not leak whether Resend is configured.
  // When Resend is unset, link is not delivered — log is already emitted by helper.
  return NextResponse.json({
    ok: true,
    email,
    sent,
    message: sent
      ? "Check your email for a one-time sign-in link."
      : "If email delivery is configured, a link was sent. Otherwise ask the operator to set RESEND_API_KEY.",
  });
}
