import { NextRequest, NextResponse } from "next/server";
import {
  applySessionCookie,
  isAuthSecretConfigured,
} from "@/lib/auth";
import { consumeMagicLinkToken } from "@/lib/db";
import { getSiteUrl, localizedPath } from "@/lib/seo";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const localeRaw = (req.nextUrl.searchParams.get("locale") || "en").toLowerCase();
  const locale = routing.locales.includes(
    localeRaw as (typeof routing.locales)[number]
  )
    ? localeRaw
    : routing.defaultLocale;

  const base = getSiteUrl();
  const okPath = `${base}${localizedPath(locale, "/login")}?verified=1`;

  if (!isAuthSecretConfigured()) {
    return NextResponse.redirect(
      `${base}${localizedPath(locale, "/login")}?error=auth_misconfigured`
    );
  }

  const result = await consumeMagicLinkToken(token);
  if (!result.ok) {
    const code =
      result.reason === "expired"
        ? "expired"
        : result.reason === "used"
          ? "used"
          : "invalid_link";
    return NextResponse.redirect(
      `${base}${localizedPath(locale, "/login")}?error=${code}`
    );
  }

  const res = NextResponse.redirect(okPath);
  applySessionCookie(res, result.email);
  return res;
}
