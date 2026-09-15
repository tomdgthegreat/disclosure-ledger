import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSessionStub } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
  };
  const origin = req.nextUrl.origin;
  const result = await createCheckoutSessionStub({
    successUrl: `${origin}/create?checkout=success`,
    cancelUrl: `${origin}/create?checkout=cancel`,
    customerEmail: body.email,
  });
  return NextResponse.json(result);
}
