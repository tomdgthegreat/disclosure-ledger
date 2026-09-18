import { NextRequest, NextResponse } from "next/server";
import { resolveGatedEmail } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/seo";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
  };
  const gated = resolveGatedEmail(req, body.email);
  if (!gated.ok) {
    return NextResponse.json(
      {
        url: null,
        stub: false,
        message: gated.message,
        error: gated.code,
      },
      { status: gated.code === "auth_misconfigured" ? 503 : 401 }
    );
  }
  const email = gated.email;

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
