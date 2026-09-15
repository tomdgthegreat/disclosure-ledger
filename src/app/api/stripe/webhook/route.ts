import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { upsertStripeEntitlement, normalizeEmail } from "@/lib/db";
import { sendEntitlementConfirmationEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function emailFromCustomer(
  stripe: Stripe,
  customerId: string | Stripe.Customer | Stripe.DeletedCustomer | null
): Promise<string | null> {
  if (!customerId) return null;
  if (typeof customerId === "object") {
    if ("deleted" in customerId && customerId.deleted) return null;
    const email = "email" in customerId ? customerId.email : null;
    return normalizeEmail(email);
  }
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return normalizeEmail(customer.email);
  } catch (e) {
    console.error("[stripe webhook] customer retrieve failed", e);
    return null;
  }
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<void> {
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer && !("deleted" in session.customer)
        ? session.customer.id
        : null;
  if (!customerId) {
    console.error("[stripe webhook] checkout.session.completed missing customer");
    return;
  }

  const metaEmail = normalizeEmail(
    session.metadata?.customer_email ?? session.customer_details?.email ?? null
  );
  const email =
    metaEmail ?? (await emailFromCustomer(stripe, customerId));

  let subscriptionId: string | null =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  let status = "active";

  if (subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      status = sub.status;
      subscriptionId = sub.id;
    } catch (e) {
      console.error("[stripe webhook] subscription retrieve failed", e);
    }
  }

  await upsertStripeEntitlement({
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: status,
  });

  // Optional post-checkout confirmation — gated by RESEND_API_KEY; never throws
  if (email) {
    await sendEntitlementConfirmationEmail({
      email,
      subscriptionStatus: status,
    });
  }
}

async function handleSubscriptionEvent(
  stripe: Stripe,
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const metaEmail = normalizeEmail(
    subscription.metadata?.customer_email ?? null
  );
  const email =
    metaEmail ?? (await emailFromCustomer(stripe, customerId));

  await upsertStripeEntitlement({
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
  });
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 503 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          await handleCheckoutCompleted(stripe, session);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionEvent(stripe, subscription);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("[stripe webhook] handler error", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
