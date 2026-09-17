/**
 * Persist hygiene scans (Postgres via Prisma, or local JSON fallback).
 */

import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type { Prisma } from "@prisma/client";
import { isDatabaseUrlConfigured, normalizeEmail } from "./db";
import { getPrisma } from "./prisma";
import type { CrawlFinding, CrawlResult } from "./scanCrawl";

export type StoredScanFinding = CrawlFinding & { id: string };

export type StoredScan = {
  id: string;
  createdAt: string;
  contactEmail: string;
  targetUrl: string;
  status: string;
  pagesCrawled: number;
  imagesChecked: number;
  summary: CrawlResult["summary"];
  entitlementId: string | null;
  findings: StoredScanFinding[];
  /** Redacted in public API responses */
  isPaid?: boolean;
};

type JsonDb = { scans: StoredScan[] };

const DATA_DIR = path.join(process.cwd(), "data");
const JSON_SCANS_PATH = path.join(DATA_DIR, "scans.json");

async function readJson(): Promise<JsonDb> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(JSON_SCANS_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<JsonDb>;
    return { scans: Array.isArray(parsed.scans) ? parsed.scans : [] };
  } catch {
    const empty: JsonDb = { scans: [] };
    await fs.writeFile(JSON_SCANS_PATH, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
}

async function writeJson(db: JsonDb): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(JSON_SCANS_PATH, JSON.stringify(db, null, 2), "utf8");
}

function toStoredFromPrisma(row: {
  id: string;
  createdAt: Date;
  contactEmail: string;
  targetUrl: string;
  status: string;
  pagesCrawled: number;
  imagesChecked: number;
  summary: Prisma.JsonValue;
  entitlementId: string | null;
  findings: {
    id: string;
    kind: string;
    severity: string;
    pageUrl: string | null;
    assetUrl: string | null;
    message: string;
    evidence: Prisma.JsonValue | null;
  }[];
}): StoredScan {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    contactEmail: row.contactEmail,
    targetUrl: row.targetUrl,
    status: row.status,
    pagesCrawled: row.pagesCrawled,
    imagesChecked: row.imagesChecked,
    summary: row.summary as StoredScan["summary"],
    entitlementId: row.entitlementId,
    findings: row.findings.map((f) => ({
      id: f.id,
      kind: f.kind as CrawlFinding["kind"],
      severity: "review" as const,
      pageUrl: f.pageUrl ?? undefined,
      assetUrl: f.assetUrl ?? undefined,
      message: f.message,
      evidence: (f.evidence as Record<string, unknown> | null) ?? undefined,
    })),
  };
}

export async function createScanRecord(params: {
  contactEmail: string;
  targetUrl: string;
  entitlementId: string | null;
  crawl: CrawlResult;
}): Promise<StoredScan> {
  const id = `sc_${nanoid(12)}`;
  const email = normalizeEmail(params.contactEmail)!;
  const findings: StoredScanFinding[] = params.crawl.findings.map((f) => ({
    ...f,
    id: `sf_${nanoid(10)}`,
  }));

  const stored: StoredScan = {
    id,
    createdAt: new Date().toISOString(),
    contactEmail: email,
    targetUrl: params.targetUrl,
    status: params.crawl.status,
    pagesCrawled: params.crawl.pagesCrawled,
    imagesChecked: params.crawl.imagesChecked,
    summary: params.crawl.summary,
    entitlementId: params.entitlementId,
    findings,
  };

  if (!isDatabaseUrlConfigured()) {
    const db = await readJson();
    db.scans.push(stored);
    await writeJson(db);
    return stored;
  }

  const prisma = getPrisma();
  const row = await prisma.scan.create({
    data: {
      id,
      contactEmail: email,
      targetUrl: params.targetUrl,
      status: params.crawl.status,
      pagesCrawled: params.crawl.pagesCrawled,
      imagesChecked: params.crawl.imagesChecked,
      summary: params.crawl.summary as unknown as Prisma.InputJsonValue,
      entitlementId: params.entitlementId,
      findings: {
        create: findings.map((f) => ({
          id: f.id,
          kind: f.kind,
          severity: f.severity,
          pageUrl: f.pageUrl ?? null,
          assetUrl: f.assetUrl ?? null,
          message: f.message,
          evidence: (f.evidence ?? undefined) as
            | Prisma.InputJsonValue
            | undefined,
        })),
      },
    },
    include: { findings: true },
  });
  return toStoredFromPrisma(row);
}

export async function getScan(id: string): Promise<StoredScan | null> {
  if (!isDatabaseUrlConfigured()) {
    const db = await readJson();
    return db.scans.find((s) => s.id === id) ?? null;
  }
  const row = await getPrisma().scan.findUnique({
    where: { id },
    include: { findings: true },
  });
  return row ? toStoredFromPrisma(row) : null;
}

/** Public view: redact contact email */
export function toPublicScan(scan: StoredScan) {
  return {
    id: scan.id,
    createdAt: scan.createdAt,
    targetUrl: scan.targetUrl,
    status: scan.status,
    pagesCrawled: scan.pagesCrawled,
    imagesChecked: scan.imagesChecked,
    summary: scan.summary,
    findings: scan.findings.map((f) => ({
      id: f.id,
      kind: f.kind,
      severity: f.severity,
      pageUrl: f.pageUrl,
      assetUrl: f.assetUrl,
      message: f.message,
      evidence: f.evidence,
    })),
    findingCount: scan.findings.length,
  };
}
