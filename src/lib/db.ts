import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "./prisma";
import {
  MAGIC_REQUEST_COOLDOWN_MS,
  MAGIC_TOKEN_TTL_MS,
  generateMagicToken,
  hashToken,
} from "./auth";
import type {
  CreateRecordInput,
  DisclosureRecord,
  ProvenanceSummary,
} from "./types";

export const FREE_TIER_LIMIT = 3;

const PAID_STATUSES = new Set(["active", "trialing"]);

const DATA_DIR = path.join(process.cwd(), "data");
const JSON_DB_PATH = path.join(DATA_DIR, "db.json");

type JsonEntitlement = {
  id: string;
  email: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
};

type JsonPrivacyRequest = {
  id: string;
  createdAt: string;
  email: string;
  type: string;
  note?: string;
};

type JsonMagicLinkToken = {
  id: string;
  email: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};

type JsonDbShape = {
  records: DisclosureRecord[];
  entitlements: JsonEntitlement[];
  privacyRequests: JsonPrivacyRequest[];
  magicLinkTokens: JsonMagicLinkToken[];
};

let warnedJsonFallback = false;

export function isDatabaseUrlConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function warnJsonFallbackOnce(): void {
  if (warnedJsonFallback) return;
  warnedJsonFallback = true;
  console.error(
    "[disclosure-ledger] DATABASE_URL is not set — falling back to local JSON file storage at data/db.json. " +
      "This is NOT durable on serverless (Vercel). Set DATABASE_URL (Neon / Vercel Postgres) for production."
  );
}

async function readJsonDb(): Promise<JsonDbShape> {
  warnJsonFallbackOnce();
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(JSON_DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<JsonDbShape>;
    return {
      records: Array.isArray(parsed.records) ? parsed.records : [],
      entitlements: Array.isArray(parsed.entitlements)
        ? parsed.entitlements
        : [],
      privacyRequests: Array.isArray(parsed.privacyRequests)
        ? parsed.privacyRequests
        : [],
      magicLinkTokens: Array.isArray(parsed.magicLinkTokens)
        ? parsed.magicLinkTokens
        : [],
    };
  } catch {
    const empty: JsonDbShape = {
      records: [],
      entitlements: [],
      privacyRequests: [],
      magicLinkTokens: [],
    };
    await fs.writeFile(JSON_DB_PATH, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
}

async function writeJsonDb(db: JsonDbShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(JSON_DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export function normalizeEmail(
  email: string | null | undefined
): string | null {
  if (!email) return null;
  const t = email.trim().toLowerCase();
  if (!t || !t.includes("@") || t.length < 3) return null;
  return t.slice(0, 320);
}

function toRecordFromPrisma(row: {
  id: string;
  createdAt: Date;
  contentHashSha256: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  aiDeclaration: string;
  notes: string;
  contactEmail: string | null;
  provenance: Prisma.JsonValue;
}): DisclosureRecord {
  const p = (row.provenance ?? {}) as Partial<ProvenanceSummary>;
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    contentHashSha256: row.contentHashSha256,
    fileName: row.fileName,
    fileSizeBytes: row.fileSizeBytes,
    mimeType: row.mimeType,
    aiDeclaration: row.aiDeclaration as DisclosureRecord["aiDeclaration"],
    notes: row.notes,
    contactEmail: row.contactEmail,
    provenance: {
      found: Boolean(p.found),
      method: String(p.method ?? "unknown"),
      details: String(p.details ?? ""),
      signals: Array.isArray(p.signals) ? p.signals.map(String) : [],
    },
  };
}

export async function listRecords(): Promise<DisclosureRecord[]> {
  if (!isDatabaseUrlConfigured()) {
    const db = await readJsonDb();
    return [...db.records].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    );
  }
  const rows = await getPrisma().disclosureRecord.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toRecordFromPrisma);
}

export async function getRecord(id: string): Promise<DisclosureRecord | null> {
  if (!isDatabaseUrlConfigured()) {
    const db = await readJsonDb();
    return db.records.find((r) => r.id === id) ?? null;
  }
  const row = await getPrisma().disclosureRecord.findUnique({ where: { id } });
  return row ? toRecordFromPrisma(row) : null;
}

export async function countRecords(): Promise<number> {
  if (!isDatabaseUrlConfigured()) {
    const db = await readJsonDb();
    return db.records.length;
  }
  return getPrisma().disclosureRecord.count();
}

export async function countRecordsForEmail(email: string): Promise<number> {
  const normalized = normalizeEmail(email);
  if (!normalized) return 0;
  if (!isDatabaseUrlConfigured()) {
    const db = await readJsonDb();
    return db.records.filter(
      (r) => normalizeEmail(r.contactEmail) === normalized
    ).length;
  }
  return getPrisma().disclosureRecord.count({
    where: { contactEmail: normalized },
  });
}

export type EntitlementView = {
  entitlementId: string;
  email: string;
  stripeCustomerId: string | null;
  subscriptionStatus: string;
  isPaid: boolean;
  freeUsed: number;
  freeLimit: number;
  freeRemaining: number;
  canCreate: boolean;
};

async function getOrCreateEntitlementPg(email: string) {
  const prisma = getPrisma();
  const existing = await prisma.entitlement.findUnique({ where: { email } });
  if (existing) return existing;
  return prisma.entitlement.create({
    data: { email, subscriptionStatus: "none" },
  });
}

async function getOrCreateEntitlementJson(
  db: JsonDbShape,
  email: string
): Promise<JsonEntitlement> {
  const existing = db.entitlements.find((e) => e.email === email);
  if (existing) return existing;
  const now = new Date().toISOString();
  const created: JsonEntitlement = {
    id: nanoid(12),
    email,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: "none",
    createdAt: now,
    updatedAt: now,
  };
  db.entitlements.push(created);
  return created;
}

/**
 * Resolve free-tier / paid entitlement for a contact email.
 * Free tier: 3 records per contact email. Paid unlocks unlimited creates for that email.
 */
export async function resolveEntitlement(params: {
  email?: string | null;
}): Promise<EntitlementView | null> {
  const email = normalizeEmail(params.email);
  if (!email) return null;

  if (!isDatabaseUrlConfigured()) {
    const db = await readJsonDb();
    const ent = await getOrCreateEntitlementJson(db, email);
    await writeJsonDb(db);
    const freeUsed = db.records.filter(
      (r) => normalizeEmail(r.contactEmail) === email
    ).length;
    const isPaid = PAID_STATUSES.has(ent.subscriptionStatus);
    return {
      entitlementId: ent.id,
      email,
      stripeCustomerId: ent.stripeCustomerId,
      subscriptionStatus: ent.subscriptionStatus,
      isPaid,
      freeUsed,
      freeLimit: FREE_TIER_LIMIT,
      freeRemaining: isPaid
        ? FREE_TIER_LIMIT
        : Math.max(0, FREE_TIER_LIMIT - freeUsed),
      canCreate: isPaid || freeUsed < FREE_TIER_LIMIT,
    };
  }

  const ent = await getOrCreateEntitlementPg(email);
  const freeUsed = await countRecordsForEmail(email);
  const isPaid = PAID_STATUSES.has(ent.subscriptionStatus);
  return {
    entitlementId: ent.id,
    email,
    stripeCustomerId: ent.stripeCustomerId,
    subscriptionStatus: ent.subscriptionStatus,
    isPaid,
    freeUsed,
    freeLimit: FREE_TIER_LIMIT,
    freeRemaining: isPaid
      ? FREE_TIER_LIMIT
      : Math.max(0, FREE_TIER_LIMIT - freeUsed),
    canCreate: isPaid || freeUsed < FREE_TIER_LIMIT,
  };
}

export async function createRecord(
  input: CreateRecordInput,
  entitlementId?: string | null
): Promise<DisclosureRecord> {
  const id = nanoid(12);
  const contactEmail = normalizeEmail(input.contactEmail);
  const record: DisclosureRecord = {
    id,
    createdAt: new Date().toISOString(),
    contentHashSha256: input.contentHashSha256.toLowerCase(),
    fileName: input.fileName.slice(0, 255),
    fileSizeBytes: input.fileSizeBytes,
    mimeType: input.mimeType.slice(0, 128),
    aiDeclaration: input.aiDeclaration,
    notes: (input.notes ?? "").slice(0, 2000),
    contactEmail,
    provenance: input.provenance,
  };

  if (!isDatabaseUrlConfigured()) {
    const db = await readJsonDb();
    db.records.push(record);
    await writeJsonDb(db);
    return record;
  }

  const row = await getPrisma().disclosureRecord.create({
    data: {
      id,
      contentHashSha256: record.contentHashSha256,
      fileName: record.fileName,
      fileSizeBytes: record.fileSizeBytes,
      mimeType: record.mimeType,
      aiDeclaration: record.aiDeclaration,
      notes: record.notes,
      contactEmail: record.contactEmail,
      provenance: record.provenance as unknown as Prisma.InputJsonValue,
      entitlementId: entitlementId ?? null,
    },
  });
  return toRecordFromPrisma(row);
}

/** Upsert entitlements from Stripe webhook events (keyed by email / Stripe customer). */
export async function upsertStripeEntitlement(params: {
  email?: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
  subscriptionStatus: string;
}): Promise<void> {
  const email = normalizeEmail(params.email);
  const stripeCustomerId = params.stripeCustomerId.trim();
  if (!stripeCustomerId) return;

  if (!isDatabaseUrlConfigured()) {
    const db = await readJsonDb();
    const now = new Date().toISOString();
    let ent =
      db.entitlements.find((e) => e.stripeCustomerId === stripeCustomerId) ??
      (email ? db.entitlements.find((e) => e.email === email) : undefined);
    if (!ent) {
      if (!email) {
        console.error(
          "[disclosure-ledger] webhook entitlement upsert skipped: no email and no existing Stripe customer"
        );
        return;
      }
      ent = {
        id: nanoid(12),
        email,
        stripeCustomerId,
        stripeSubscriptionId: params.stripeSubscriptionId ?? null,
        subscriptionStatus: params.subscriptionStatus,
        createdAt: now,
        updatedAt: now,
      };
      db.entitlements.push(ent);
    } else {
      ent.stripeCustomerId = stripeCustomerId;
      if (params.stripeSubscriptionId !== undefined) {
        ent.stripeSubscriptionId = params.stripeSubscriptionId;
      }
      ent.subscriptionStatus = params.subscriptionStatus;
      if (email) ent.email = email;
      ent.updatedAt = now;
    }
    await writeJsonDb(db);
    return;
  }

  const prisma = getPrisma();
  const existingByStripe = await prisma.entitlement.findUnique({
    where: { stripeCustomerId },
  });
  const existingByEmail =
    !existingByStripe && email
      ? await prisma.entitlement.findUnique({ where: { email } })
      : null;

  const data = {
    stripeCustomerId,
    stripeSubscriptionId: params.stripeSubscriptionId ?? undefined,
    subscriptionStatus: params.subscriptionStatus,
    ...(email ? { email } : {}),
  };

  if (existingByStripe) {
    await prisma.entitlement.update({
      where: { id: existingByStripe.id },
      data,
    });
    return;
  }
  if (existingByEmail) {
    await prisma.entitlement.update({
      where: { id: existingByEmail.id },
      data,
    });
    return;
  }
  if (!email) {
    console.error(
      "[disclosure-ledger] webhook entitlement create skipped: email required for new entitlement"
    );
    return;
  }
  await prisma.entitlement.create({
    data: {
      email,
      ...data,
    },
  });
}

export async function createPrivacyRequest(input: {
  email: string;
  type: "access" | "erasure" | "rectification";
  note?: string;
}): Promise<{ id: string }> {
  const email = normalizeEmail(input.email);
  if (!email) throw new Error("Valid email required");
  const id = `pr_${nanoid(10)}`;

  if (!isDatabaseUrlConfigured()) {
    const db = await readJsonDb();
    db.privacyRequests.push({
      id,
      createdAt: new Date().toISOString(),
      email,
      type: input.type,
      ...(input.note ? { note: input.note.slice(0, 2000) } : {}),
    });
    await writeJsonDb(db);
    return { id };
  }

  await getPrisma().privacyRequest.create({
    data: {
      id,
      email,
      type: input.type,
      note: input.note ? input.note.slice(0, 2000) : null,
    },
  });
  return { id };
}


// --- Magic-link tokens (Prisma when DATABASE_URL set; else data/db.json) ---

export type CreateMagicLinkResult =
  | { ok: true; token: string; expiresAt: Date }
  | { ok: false; reason: "rate_limited"; retryAfterMs: number }
  | { ok: false; reason: "invalid_email" };

export async function createMagicLinkToken(
  emailInput: string
): Promise<CreateMagicLinkResult> {
  const email = normalizeEmail(emailInput);
  if (!email) return { ok: false, reason: "invalid_email" };

  const now = Date.now();
  const expiresAt = new Date(now + MAGIC_TOKEN_TTL_MS);
  const rawToken = generateMagicToken();
  const tokenHash = hashToken(rawToken);
  const id = `ml_${nanoid(12)}`;

  if (!isDatabaseUrlConfigured()) {
    const db = await readJsonDb();
    const recent = db.magicLinkTokens
      .filter((t) => t.email === email)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
    if (recent) {
      const age = now - new Date(recent.createdAt).getTime();
      if (age < MAGIC_REQUEST_COOLDOWN_MS) {
        return {
          ok: false,
          reason: "rate_limited",
          retryAfterMs: MAGIC_REQUEST_COOLDOWN_MS - age,
        };
      }
    }
    // Drop prior tokens for this email + expired/used globally (JSON hygiene)
    db.magicLinkTokens = db.magicLinkTokens.filter((t) => {
      if (t.email === email) return false;
      if (t.usedAt) return false;
      if (new Date(t.expiresAt).getTime() <= now) return false;
      return true;
    });
    db.magicLinkTokens.push({
      id,
      email,
      tokenHash,
      expiresAt: expiresAt.toISOString(),
      usedAt: null,
      createdAt: new Date(now).toISOString(),
    });
    await writeJsonDb(db);
    return { ok: true, token: rawToken, expiresAt };
  }

  const prisma = getPrisma();
  const latest = await prisma.magicLinkToken.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
  if (latest) {
    const age = now - latest.createdAt.getTime();
    if (age < MAGIC_REQUEST_COOLDOWN_MS) {
      return {
        ok: false,
        reason: "rate_limited",
        retryAfterMs: MAGIC_REQUEST_COOLDOWN_MS - age,
      };
    }
  }

  await prisma.magicLinkToken.create({
    data: {
      id,
      email,
      tokenHash,
      expiresAt,
    },
  });
  return { ok: true, token: rawToken, expiresAt };
}

export type ConsumeMagicLinkResult =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "expired" | "used" };

export async function consumeMagicLinkToken(
  rawToken: string
): Promise<ConsumeMagicLinkResult> {
  if (!rawToken || rawToken.length < 16) {
    return { ok: false, reason: "invalid" };
  }
  const tokenHash = hashToken(rawToken);
  const now = Date.now();

  if (!isDatabaseUrlConfigured()) {
    const db = await readJsonDb();
    const row = db.magicLinkTokens.find((t) => t.tokenHash === tokenHash);
    if (!row) return { ok: false, reason: "invalid" };
    if (row.usedAt) return { ok: false, reason: "used" };
    if (new Date(row.expiresAt).getTime() < now) {
      return { ok: false, reason: "expired" };
    }
    row.usedAt = new Date(now).toISOString();
    await writeJsonDb(db);
    return { ok: true, email: row.email };
  }

  const prisma = getPrisma();
  const row = await prisma.magicLinkToken.findUnique({
    where: { tokenHash },
  });
  if (!row) return { ok: false, reason: "invalid" };
  if (row.usedAt) return { ok: false, reason: "used" };
  if (row.expiresAt.getTime() < now) return { ok: false, reason: "expired" };

  const updated = await prisma.magicLinkToken.updateMany({
    where: { id: row.id, usedAt: null },
    data: { usedAt: new Date(now) },
  });
  if (updated.count === 0) return { ok: false, reason: "used" };
  return { ok: true, email: row.email };
}
