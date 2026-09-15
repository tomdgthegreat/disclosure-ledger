/**
 * Stripe Checkout stub for $29/mo after free tier.
 * Set STRIPE_SECRET_KEY + STRIPE_PRICE_ID to enable live checkout sessions.
 * Without keys, the UI still shows pricing and soft-gates create after 3 records.
 */

export const MONTHLY_PRICE_USD = 29;

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID
  );
}

export async function createCheckoutSessionStub(params: {
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}): Promise<{ url: string | null; stub: boolean; message: string }> {
  if (!isStripeConfigured()) {
    return {
      url: null,
      stub: true,
      message:
        "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID to enable Checkout. Soft-gate only for local MVP.",
    };
  }

  // Stub: real Stripe SDK call would go here once keys + price are set.
  // Intentionally not importing stripe package yet to keep Day-1 deps light.
  void params;
  return {
    url: null,
    stub: true,
    message:
      "Stripe keys detected but Checkout integration is stubbed for Day-1. Wire stripe.checkout.sessions.create next.",
  };
}
