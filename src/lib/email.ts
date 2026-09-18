/**
 * Resend email helpers for Disclosure Ledger.
 * Gated by RESEND_API_KEY — if missing, helpers no-op / log a warning and never throw.
 * From: RESEND_FROM (default Disclosure Ledger <hello@discloseledger.com>).
 * Tom must verify discloseledger.com in Resend (see DEPLOY.md / README).
 */

import { Resend } from "resend";

const OPS_INBOX = "hello@discloseledger.com";
const DEFAULT_FROM = "Disclosure Ledger <hello@discloseledger.com>";

function getFrom(): string {
  return process.env.RESEND_FROM?.trim() || DEFAULT_FROM;
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn(
      "[disclosure-ledger] RESEND_API_KEY unset — email helpers are no-ops"
    );
    return null;
  }
  return new Resend(key);
}

async function sendSafe(params: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) return false;

    const { error } = await resend.emails.send({
      from: getFrom(),
      to: params.to,
      subject: params.subject,
      text: params.text,
      ...(params.html ? { html: params.html } : {}),
    });

    if (error) {
      console.warn("[disclosure-ledger] Resend send failed:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[disclosure-ledger] Resend send error (non-fatal):", e);
    return false;
  }
}

export type PrivacyRequestType = "access" | "erasure" | "rectification";

/**
 * Confirm a privacy request to ops inbox AND the requester.
 * Never throws — safe to call from the create happy path.
 */
export async function sendPrivacyRequestConfirmation(params: {
  id: string;
  email: string;
  type: PrivacyRequestType;
  note?: string;
}): Promise<void> {
  const { id, email, type, note } = params;
  const typeLabel =
    type === "access"
      ? "access"
      : type === "erasure"
        ? "erasure"
        : "rectification";

  const opsText = [
    `Privacy request received (${id}).`,
    `Type: ${typeLabel}`,
    `Requester: ${email}`,
    note ? `Note: ${note}` : null,
    "",
    "Disclosure Ledger — Atlas AG LLC",
    "This is an operational notification, not a legal determination.",
  ]
    .filter(Boolean)
    .join("\n");

  const requesterText = [
    `We received your privacy request (${id}).`,
    `Type: ${typeLabel}`,
    note ? `Your note: ${note}` : null,
    "",
    "We will review and respond using the email you provided.",
    "Contact: hello@discloseledger.com",
    "",
    "Disclosure Ledger — Atlas AG LLC",
    "This confirmation acknowledges receipt only; it is not a determination of rights or compliance.",
  ]
    .filter(Boolean)
    .join("\n");

  await sendSafe({
    to: OPS_INBOX,
    subject: `[Disclosure Ledger] Privacy request ${id} (${typeLabel})`,
    text: opsText,
  });

  await sendSafe({
    to: email,
    subject: `We received your privacy request (${id})`,
    text: requesterText,
  });
}

/**
 * Optional post-checkout entitlement confirmation to the customer.
 * Call from Stripe webhook after a successful entitlement upsert.
 * Never throws.
 */
export async function sendEntitlementConfirmationEmail(params: {
  email: string;
  subscriptionStatus?: string | null;
}): Promise<void> {
  const { email, subscriptionStatus } = params;
  if (!email) return;

  const statusLine = subscriptionStatus
    ? `Subscription status: ${subscriptionStatus}`
    : null;

  const text = [
    "Thank you for subscribing to Disclosure Ledger.",
    "Your paid entitlement is now active for this email address.",
    "You can create unlimited self-reported declaration records while your subscription remains active.",
    statusLine,
    "",
    "Create a record: https://discloseledger.com/create",
    "Contact: hello@discloseledger.com",
    "",
    "Disclosure Ledger — Atlas AG LLC",
    "Declarations remain self-reported and unverified. This email does not claim Art. 50 compliance or legal adequacy.",
  ]
    .filter(Boolean)
    .join("\n");

  await sendSafe({
    to: email,
    subject: "Disclosure Ledger — subscription confirmed",
    text,
  });
}

/**
 * Send a one-time magic-link sign-in email.
 * Never throws — returns false if Resend is unset or send fails.
 */
export async function sendMagicLinkEmail(params: {
  to: string;
  url: string;
}): Promise<boolean> {
  const { to, url } = params;
  if (!to || !url) return false;

  const text = [
    "Sign in to Disclosure Ledger",
    "",
    "Click this one-time link to verify your email and continue:",
    url,
    "",
    "This link expires in about 20 minutes and can be used only once.",
    "If you did not request this, you can ignore this email.",
    "",
    "Disclosure Ledger — Atlas AG LLC",
    "This message only verifies inbox ownership for your session. It is not a compliance determination.",
  ].join("\n");

  const html = [
    "<p><strong>Sign in to Disclosure Ledger</strong></p>",
    "<p>Click this one-time link to verify your email and continue:</p>",
    `<p><a href="${url}">${url}</a></p>`,
    "<p>This link expires in about 20 minutes and can be used only once.</p>",
    "<p>If you did not request this, you can ignore this email.</p>",
    "<p style=\"color:#666;font-size:12px\">Disclosure Ledger — Atlas AG LLC. This message only verifies inbox ownership for your session. It is not a compliance determination.</p>",
  ].join("\n");

  return sendSafe({
    to,
    subject: "Your Disclosure Ledger sign-in link",
    text,
    html,
  });
}

