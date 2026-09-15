import { NextRequest, NextResponse } from "next/server";
import { listRecords } from "@/lib/db";
import { recordsToCsv } from "@/lib/csv";

function authorized(req: NextRequest): boolean {
  const expected = process.env.OPS_PASSWORD;
  if (!expected) return false;
  const header = req.headers.get("x-ops-password") ?? "";
  const urlPass = req.nextUrl.searchParams.get("password") ?? "";
  return header === expected || urlPass === expected;
}

export async function GET(req: NextRequest) {
  if (!process.env.OPS_PASSWORD) {
    return NextResponse.json(
      { error: "OPS_PASSWORD not set" },
      { status: 503 }
    );
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const records = await listRecords();
  const format = req.nextUrl.searchParams.get("format");
  if (format === "csv") {
    // Ops CSV may include contactEmail
    return new NextResponse(recordsToCsv(records, { public: false }), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="disclosure-records.csv"',
      },
    });
  }
  return NextResponse.json({ records, count: records.length });
}
