import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE = path.join(DATA_DIR, "privacy-requests.json");

type PrivacyRequestType = "access" | "erasure" | "rectification";

type PrivacyRequest = {
  id: string;
  createdAt: string;
  email: string;
  type: PrivacyRequestType;
  note?: string;
};

async function readStore(): Promise<PrivacyRequest[]> {
  try {
    const raw = await fs.readFile(STORE, "utf8");
    const parsed = JSON.parse(raw) as PrivacyRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as {
    email?: unknown;
    type?: unknown;
    note?: unknown;
  };
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const type = b.type;
  const note =
    typeof b.note === "string" && b.note.trim() ? b.note.trim() : undefined;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (type !== "access" && type !== "erasure" && type !== "rectification") {
    return NextResponse.json(
      { error: "type must be access | erasure | rectification" },
      { status: 400 }
    );
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  const existing = await readStore();
  const entry: PrivacyRequest = {
    id: `pr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    email,
    type,
    ...(note ? { note } : {}),
  };
  existing.push(entry);
  await fs.writeFile(STORE, JSON.stringify(existing, null, 2) + "\n", "utf8");

  return NextResponse.json({ ok: true, id: entry.id }, { status: 200 });
}
