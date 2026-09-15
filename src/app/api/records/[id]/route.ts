import { NextResponse } from "next/server";
import { getRecord } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const record = await getRecord(params.id);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Public JSON: redact contactEmail
  const publicRecord = {
    id: record.id,
    createdAt: record.createdAt,
    contentHashSha256: record.contentHashSha256,
    fileName: record.fileName,
    fileSizeBytes: record.fileSizeBytes,
    mimeType: record.mimeType,
    aiDeclaration: record.aiDeclaration,
    notes: record.notes,
    provenance: record.provenance,
  };
  return NextResponse.json({ record: publicRecord });
}
