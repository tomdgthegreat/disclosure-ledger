import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type { CreateRecordInput, DisclosureRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "records.json");

type DbShape = {
  records: DisclosureRecord[];
};

async function ensureDb(): Promise<DbShape> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as DbShape;
    if (!Array.isArray(parsed.records)) {
      return { records: [] };
    }
    return parsed;
  } catch {
    const empty: DbShape = { records: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
}

async function writeDb(db: DbShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function listRecords(): Promise<DisclosureRecord[]> {
  const db = await ensureDb();
  return [...db.records].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );
}

export async function getRecord(id: string): Promise<DisclosureRecord | null> {
  const db = await ensureDb();
  return db.records.find((r) => r.id === id) ?? null;
}

export async function countRecords(): Promise<number> {
  const db = await ensureDb();
  return db.records.length;
}

export async function createRecord(
  input: CreateRecordInput
): Promise<DisclosureRecord> {
  const db = await ensureDb();
  const record: DisclosureRecord = {
    id: nanoid(12),
    createdAt: new Date().toISOString(),
    contentHashSha256: input.contentHashSha256.toLowerCase(),
    fileName: input.fileName.slice(0, 255),
    fileSizeBytes: input.fileSizeBytes,
    mimeType: input.mimeType.slice(0, 128),
    aiDeclaration: input.aiDeclaration,
    notes: (input.notes ?? "").slice(0, 2000),
    contactEmail: input.contactEmail
      ? input.contactEmail.trim().slice(0, 320)
      : null,
    provenance: input.provenance,
  };
  db.records.push(record);
  await writeDb(db);
  return record;
}

export const FREE_TIER_LIMIT = 3;
