import { NextResponse } from "next/server";
import { createPrivacyRequest, normalizeEmail } from "@/lib/db";

type PrivacyRequestType = "access" | "erasure" | "rectification";

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
  const email = normalizeEmail(typeof b.email === "string" ? b.email : null);
  const type = b.type as PrivacyRequestType | unknown;
  const note =
    typeof b.note === "string" && b.note.trim() ? b.note.trim() : undefined;

  if (!email) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (type !== "access" && type !== "erasure" && type !== "rectification") {
    return NextResponse.json(
      { error: "type must be access | erasure | rectification" },
      { status: 400 }
    );
  }

  try {
    const entry = await createPrivacyRequest({
      email,
      type,
      note,
    });
    return NextResponse.json({ ok: true, id: entry.id }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to store privacy request" },
      { status: 500 }
    );
  }
}
