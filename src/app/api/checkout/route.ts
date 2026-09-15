import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/seo";
import { normalizeEmail } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
  };
  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json(
      {
        url: null,
        stub: false,
        message: "A valid contact email is required to start Checkout.",
        error: "email_required",
      },
      { status: 400 }
    );
  }

  const base = getSiteUrl();
  try {
    const result = await createCheckoutSession({
      successUrl: `${base}/create?checkout=success`,
      cancelUrl: `${base}/create?checkout=cancel`,
      customerEmail: email,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[checkout]", e);
    return NextResponse.json(
      {
        url: null,
        stub: false,
        message: "Failed to create Checkout session. Check Stripe configuration.",
        error: "checkout_failed",
      },
      { status: 500 }
    );
  }
}
