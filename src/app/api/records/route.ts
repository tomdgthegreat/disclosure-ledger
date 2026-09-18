import { NextRequest, NextResponse } from "next/server";
import { resolveGatedEmail } from "@/lib/auth";
import {
  createRecord,
  FREE_TIER_LIMIT,
  normalizeEmail,
  resolveEntitlement,
} from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";
import type { AiDeclaration, ProvenanceSummary } from "@/lib/types";

const ALLOWED: AiDeclaration[] = ["yes", "no", "partial"];

export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get("email"));
  if (!email) {
    return NextResponse.json({
      freeLimit: FREE_TIER_LIMIT,
      message:
        "Pass ?email= to check free remaining for a contact email (3 free records per email).",
    });
  }
  const entitlement = await resolveEntitlement({ email });
  return NextResponse.json({
    email,
    freeLimit: FREE_TIER_LIMIT,
    freeUsed: entitlement?.freeUsed ?? 0,
    freeRemaining: entitlement?.freeRemaining ?? FREE_TIER_LIMIT,
    isPaid: entitlement?.isPaid ?? false,
    canCreate: entitlement?.canCreate ?? true,
    subscriptionStatus: entitlement?.subscriptionStatus ?? "none",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      contentHashSha256?: string;
      fileName?: string;
      fileSizeBytes?: number;
      mimeType?: string;
      aiDeclaration?: string;
      notes?: string;
      contactEmail?: string | null;
      provenance?: ProvenanceSummary;
    };

    if (
      !body.contentHashSha256 ||
      !/^[a-fA-F0-9]{64}$/.test(body.contentHashSha256)
    ) {
      return NextResponse.json(
        { error: "contentHashSha256 must be a 64-char hex SHA-256" },
        { status: 400 }
      );
    }
    if (!body.fileName || typeof body.fileName !== "string") {
      return NextResponse.json({ error: "fileName required" }, { status: 400 });
    }
    if (
      typeof body.fileSizeBytes !== "number" ||
      body.fileSizeBytes < 0 ||
      !Number.isFinite(body.fileSizeBytes)
    ) {
      return NextResponse.json(
        { error: "fileSizeBytes required" },
        { status: 400 }
      );
    }
    if (
      !body.aiDeclaration ||
      !ALLOWED.includes(body.aiDeclaration as AiDeclaration)
    ) {
      return NextResponse.json(
        { error: "aiDeclaration must be yes|no|partial" },
        { status: 400 }
      );
    }
    if (!body.provenance || typeof body.provenance !== "object") {
      return NextResponse.json(
        { error: "provenance summary required" },
        { status: 400 }
      );
    }

    const gated = resolveGatedEmail(req, body.contactEmail);
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

    const entitlement = await resolveEntitlement({ email });
    if (!entitlement?.canCreate) {
      const stripeReady = isStripeConfigured();
      return NextResponse.json(
        {
          gated: true,
          error: "free_tier_exhausted",
          message: stripeReady
            ? "Free tier (3 records for this email) used. Subscribe via Stripe Checkout (€29/mo) to continue."
            : "Free tier (3 records for this email) used. Soft-gated: set STRIPE_SECRET_KEY and STRIPE_PRICE_ID to enable Checkout.",
          freeLimit: FREE_TIER_LIMIT,
          freeUsed: entitlement?.freeUsed ?? FREE_TIER_LIMIT,
          stripeConfigured: stripeReady,
        },
        { status: 402 }
      );
    }

    const record = await createRecord(
      {
        contentHashSha256: body.contentHashSha256,
        fileName: body.fileName,
        fileSizeBytes: Math.floor(body.fileSizeBytes),
        mimeType: body.mimeType || "application/octet-stream",
        aiDeclaration: body.aiDeclaration as AiDeclaration,
        notes: body.notes ?? "",
        contactEmail: email,
        provenance: {
          found: Boolean(body.provenance.found),
          method: String(body.provenance.method ?? "unknown").slice(0, 200),
          details: String(body.provenance.details ?? "").slice(0, 2000),
          signals: Array.isArray(body.provenance.signals)
            ? body.provenance.signals.map(String).slice(0, 50)
            : [],
        },
      },
      entitlement.entitlementId
    );

    return NextResponse.json(
      {
        record,
        entitlement: {
          isPaid: entitlement.isPaid,
          freeUsed: entitlement.freeUsed + 1,
          freeRemaining: entitlement.isPaid
            ? entitlement.freeLimit
            : Math.max(0, entitlement.freeRemaining - 1),
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 }
    );
  }
}
