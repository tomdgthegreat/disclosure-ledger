import { NextRequest, NextResponse } from "next/server";
import {
  countRecords,
  createRecord,
  FREE_TIER_LIMIT,
  listRecords,
} from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";
import type { AiDeclaration, ProvenanceSummary } from "@/lib/types";

const ALLOWED: AiDeclaration[] = ["yes", "no", "partial"];

export async function GET() {
  const records = await listRecords();
  return NextResponse.json({
    count: records.length,
    freeRemaining: Math.max(0, FREE_TIER_LIMIT - records.length),
    freeLimit: FREE_TIER_LIMIT,
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
    if (!body.aiDeclaration || !ALLOWED.includes(body.aiDeclaration as AiDeclaration)) {
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

    const count = await countRecords();
    if (count >= FREE_TIER_LIMIT) {
      const stripeReady = isStripeConfigured();
      return NextResponse.json(
        {
          gated: true,
          error: "free_tier_exhausted",
          message: stripeReady
            ? "Free tier (3 records) used. Subscribe via Stripe Checkout (~$29/mo) to continue."
            : "Free tier (3 records) used. Soft-gated: Stripe is not configured yet. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID, or clear data/records.json for local testing.",
          freeLimit: FREE_TIER_LIMIT,
          stripeConfigured: stripeReady,
        },
        { status: 402 }
      );
    }

    const record = await createRecord({
      contentHashSha256: body.contentHashSha256,
      fileName: body.fileName,
      fileSizeBytes: Math.floor(body.fileSizeBytes),
      mimeType: body.mimeType || "application/octet-stream",
      aiDeclaration: body.aiDeclaration as AiDeclaration,
      notes: body.notes ?? "",
      contactEmail: body.contactEmail ?? null,
      provenance: {
        found: Boolean(body.provenance.found),
        method: String(body.provenance.method ?? "unknown").slice(0, 200),
        details: String(body.provenance.details ?? "").slice(0, 2000),
        signals: Array.isArray(body.provenance.signals)
          ? body.provenance.signals.map(String).slice(0, 50)
          : [],
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 }
    );
  }
}
