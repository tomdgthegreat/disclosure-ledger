import { NextRequest, NextResponse } from "next/server";
import { resolveGatedEmail } from "@/lib/auth";
import { normalizeEmail } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";
import {
  FREE_LIMITS,
  FREE_SCAN_LIFETIME,
  PAID_LIMITS,
  resolveScanGate,
} from "@/lib/scanEntitlement";
import { assertSafePublicHttpUrl, runHygieneCrawl } from "@/lib/scanCrawl";
import { createScanRecord, toPublicScan } from "@/lib/scanStore";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get("email"));
  if (!email) {
    return NextResponse.json({
      freeScanLifetime: FREE_SCAN_LIFETIME,
      freeLimits: FREE_LIMITS,
      paidLimits: PAID_LIMITS,
      message:
        "Pass ?email= to check hygiene-scan entitlement (1 free scan per email lifetime; paid uses €29 Stripe entitlement).",
    });
  }
  const gate = await resolveScanGate({ email });
  return NextResponse.json({
    email: gate.email || email,
    allowed: gate.allowed,
    isPaid: gate.isPaid,
    freeScanLifetime: FREE_SCAN_LIFETIME,
    freeScansUsed: gate.freeScansUsed,
    freeScansRemaining: gate.freeScansRemaining,
    limits: gate.limits,
    ...(gate.allowed
      ? {}
      : {
          reason: gate.reason,
          message: gate.message,
          cooldownRemainingMs: gate.cooldownRemainingMs,
        }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      url?: string;
      targetUrl?: string;
      contactEmail?: string;
      email?: string;
    };

    const rawUrl = String(body.url ?? body.targetUrl ?? "").trim();

    if (!rawUrl) {
      return NextResponse.json(
        { error: "url_required", message: "A public http(s) URL is required." },
        { status: 400 }
      );
    }

    const gated = resolveGatedEmail(req, body.contactEmail ?? body.email);
    if (!gated.ok) {
      return NextResponse.json(
        {
          error: gated.code,
          message: gated.message,
        },
        { status: gated.code === "auth_misconfigured" ? 503 : 401 }
      );
    }
    const email = gated.email;

    const gate = await resolveScanGate({ email });
    if (!gate.allowed) {
      const status =
        gate.reason === "email_required"
          ? 400
          : gate.reason === "cooldown"
            ? 429
            : 402;
      return NextResponse.json(
        {
          gated: gate.reason === "free_scan_exhausted",
          error: gate.reason,
          message: gate.message,
          freeScanLifetime: FREE_SCAN_LIFETIME,
          freeScansUsed: gate.freeScansUsed,
          freeScansRemaining: gate.freeScansRemaining,
          cooldownRemainingMs: gate.cooldownRemainingMs,
          stripeConfigured: isStripeConfigured(),
          limits: gate.limits,
        },
        { status }
      );
    }

    const safe = await assertSafePublicHttpUrl(rawUrl);
    if (!safe.ok) {
      return NextResponse.json(
        { error: "unsafe_url", message: safe.error },
        { status: 400 }
      );
    }

    const crawl = await runHygieneCrawl(safe.url.toString(), gate.limits);
    const scan = await createScanRecord({
      contactEmail: gate.email,
      targetUrl: safe.url.toString(),
      entitlementId: gate.entitlementId,
      crawl,
    });

    return NextResponse.json(
      {
        scan: toPublicScan(scan),
        entitlement: {
          isPaid: gate.isPaid,
          freeScansUsed: gate.freeScansUsed + 1,
          freeScansRemaining: gate.isPaid
            ? FREE_SCAN_LIFETIME
            : Math.max(0, gate.freeScansRemaining - 1),
          limits: gate.limits,
        },
        disclaimer:
          "Results list possible disclosure gaps to review only — not an audit, compliance opinion, or Art. 50 certification.",
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("[scan]", e);
    return NextResponse.json(
      { error: "scan_failed", message: "Failed to run hygiene scan." },
      { status: 500 }
    );
  }
}
