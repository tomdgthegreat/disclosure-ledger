/**
 * Scan fair-use + monetization gates.
 * Free: 1 scan per contact email lifetime (stricter crawl caps).
 * Paid (€29 Stripe entitlement): higher caps + 10-minute cooldown between scans.
 */

import {
  isDatabaseUrlConfigured,
  normalizeEmail,
  resolveEntitlement,
} from "./db";
import { getPrisma } from "./prisma";
import type { CrawlLimits } from "./scanCrawl";
import { promises as fs } from "fs";
import path from "path";

export const FREE_SCAN_LIFETIME = 1;
export const PAID_COOLDOWN_MS = 10 * 60 * 1000;

export const FREE_LIMITS: CrawlLimits = {
  maxPages: 8,
  maxImages: 15,
  fetchTimeoutMs: 8_000,
  overallBudgetMs: 45_000,
};

export const PAID_LIMITS: CrawlLimits = {
  maxPages: 20,
  maxImages: 40,
  fetchTimeoutMs: 10_000,
  overallBudgetMs: 90_000,
};

export type ScanGate =
  | {
      allowed: true;
      email: string;
      isPaid: boolean;
      entitlementId: string;
      limits: CrawlLimits;
      freeScansUsed: number;
      freeScansRemaining: number;
    }
  | {
      allowed: false;
      email: string;
      isPaid: boolean;
      entitlementId: string | null;
      reason:
        | "email_required"
        | "free_scan_exhausted"
        | "cooldown"
        | "entitlement_error";
      message: string;
      freeScansUsed: number;
      freeScansRemaining: number;
      cooldownRemainingMs?: number;
      limits: CrawlLimits;
    };

type JsonScanStub = {
  id: string;
  contactEmail: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const JSON_SCANS_PATH = path.join(DATA_DIR, "scans.json");

async function readJsonScanStubs(): Promise<JsonScanStub[]> {
  try {
    const raw = await fs.readFile(JSON_SCANS_PATH, "utf8");
    const parsed = JSON.parse(raw) as { scans?: JsonScanStub[] };
    return Array.isArray(parsed.scans) ? parsed.scans : [];
  } catch {
    return [];
  }
}

export async function countScansForEmail(email: string): Promise<number> {
  const normalized = normalizeEmail(email);
  if (!normalized) return 0;
  if (!isDatabaseUrlConfigured()) {
    const scans = await readJsonScanStubs();
    return scans.filter(
      (s) => normalizeEmail(s.contactEmail) === normalized
    ).length;
  }
  return getPrisma().scan.count({ where: { contactEmail: normalized } });
}

export async function getLatestScanCreatedAt(
  email: string
): Promise<Date | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  if (!isDatabaseUrlConfigured()) {
    const scans = await readJsonScanStubs();
    const mine = scans
      .filter((s) => normalizeEmail(s.contactEmail) === normalized)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return mine[0] ? new Date(mine[0].createdAt) : null;
  }
  const row = await getPrisma().scan.findFirst({
    where: { contactEmail: normalized },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return row?.createdAt ?? null;
}

export async function resolveScanGate(params: {
  email?: string | null;
}): Promise<ScanGate> {
  const email = normalizeEmail(params.email);
  if (!email) {
    return {
      allowed: false,
      email: "",
      isPaid: false,
      entitlementId: null,
      reason: "email_required",
      message: "A valid contact email is required to run a hygiene scan.",
      freeScansUsed: 0,
      freeScansRemaining: FREE_SCAN_LIFETIME,
      limits: FREE_LIMITS,
    };
  }

  const entitlement = await resolveEntitlement({ email });
  if (!entitlement) {
    return {
      allowed: false,
      email,
      isPaid: false,
      entitlementId: null,
      reason: "entitlement_error",
      message: "Could not resolve entitlement for this email.",
      freeScansUsed: 0,
      freeScansRemaining: FREE_SCAN_LIFETIME,
      limits: FREE_LIMITS,
    };
  }

  const freeScansUsed = await countScansForEmail(email);
  const isPaid = entitlement.isPaid;
  const limits = isPaid ? PAID_LIMITS : FREE_LIMITS;
  const freeScansRemaining = isPaid
    ? FREE_SCAN_LIFETIME
    : Math.max(0, FREE_SCAN_LIFETIME - freeScansUsed);

  if (!isPaid && freeScansUsed >= FREE_SCAN_LIFETIME) {
    return {
      allowed: false,
      email,
      isPaid: false,
      entitlementId: entitlement.entitlementId,
      reason: "free_scan_exhausted",
      message:
        "Free hygiene scan already used for this email (1 free scan lifetime). Subscribe via Stripe Checkout (€29/mo) for fair-use paid scans.",
      freeScansUsed,
      freeScansRemaining: 0,
      limits,
    };
  }

  if (isPaid) {
    const latest = await getLatestScanCreatedAt(email);
    if (latest) {
      const elapsed = Date.now() - latest.getTime();
      if (elapsed < PAID_COOLDOWN_MS) {
        const cooldownRemainingMs = PAID_COOLDOWN_MS - elapsed;
        return {
          allowed: false,
          email,
          isPaid: true,
          entitlementId: entitlement.entitlementId,
          reason: "cooldown",
          message: `Paid fair-use cooldown: please wait ${Math.ceil(
            cooldownRemainingMs / 60_000
          )} more minute(s) between scans.`,
          freeScansUsed,
          freeScansRemaining,
          cooldownRemainingMs,
          limits,
        };
      }
    }
  }

  return {
    allowed: true,
    email,
    isPaid,
    entitlementId: entitlement.entitlementId,
    limits,
    freeScansUsed,
    freeScansRemaining,
  };
}
