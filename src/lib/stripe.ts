/**
 * Stripe Checkout (€29/mo EUR subscription) + entitlement helpers.
 * Requires STRIPE_SECRET_KEY + STRIPE_PRICE_ID (see .env.example).
 * Never invent or hardcode secret keys — only read process.env.
 */

import Stripe from "stripe";

export const MONTHLY_PRICE_EUR = 29;

/** Documented EUR €29/mo price id (not a secret). Override via STRIPE_PRICE_ID. */
export const DOCUMENTED_STRIPE_PRICE_ID = "price_1UG5ICJA3LJpXY1w7S3MbOid";

export function getStripePriceId(): string {
  return process.env.STRIPE_PRICE_ID?.trim() || DOCUMENTED_STRIPE_PRICE_ID;
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() && getStripePriceId()
  );
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}

export async function createCheckoutSession(params: {
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}): Promise<{ url: string | null; stub: boolean; message: string }> {
  if (!isStripeConfigured()) {
    return {
      url: null,
      stub: true,
      message:
        "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID (EUR €29/mo) to enable Checkout.",
    };
  }

  const stripe = getStripe();
  if (!stripe) {
    return {
      url: null,
      stub: true,
      message: "STRIPE_SECRET_KEY missing.",
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: getStripePriceId(), quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    ...(params.customerEmail
      ? { customer_email: params.customerEmail.trim().toLowerCase() }
      : {}),
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    metadata: {
      app: "disclosure-ledger",
      ...(params.customerEmail
        ? { customer_email: params.customerEmail.trim().toLowerCase() }
        : {}),
    },
    subscription_data: {
      metadata: {
        app: "disclosure-ledger",
        ...(params.customerEmail
          ? { customer_email: params.customerEmail.trim().toLowerCase() }
          : {}),
      },
    },
  });

  return {
    url: session.url,
    stub: false,
    message: "Checkout session created",
  };
}

/** @deprecated use createCheckoutSession */
export const createCheckoutSessionStub = createCheckoutSession;
