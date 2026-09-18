import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { getSiteUrl, localizedPath } from "@/lib/seo";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

function resolveLocale(req: NextRequest): string {
  const fromQuery = req.nextUrl.searchParams.get("locale");
  if (
    fromQuery &&
    routing.locales.includes(fromQuery as (typeof routing.locales)[number])
  ) {
    return fromQuery;
  }
  return routing.defaultLocale;
}

export async function POST(req: NextRequest) {
  const locale = resolveLocale(req);
  const accept = req.headers.get("accept") || "";
  if (accept.includes("text/html")) {
    const res = NextResponse.redirect(
      `${getSiteUrl()}${localizedPath(locale, "/")}`
    );
    clearSessionCookie(res);
    return res;
  }
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}

export async function GET(req: NextRequest) {
  const locale = resolveLocale(req);
  const res = NextResponse.redirect(
    `${getSiteUrl()}${localizedPath(locale, "/")}`
  );
  clearSessionCookie(res);
  return res;
}
