import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSessionStub } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/seo";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
  };
  const base = getSiteUrl();
  const result = await createCheckoutSessionStub({
    successUrl: `${base}/create?checkout=success`,
    cancelUrl: `${base}/create?checkout=cancel`,
    customerEmail: body.email,
  });
  return NextResponse.json(result);
}
