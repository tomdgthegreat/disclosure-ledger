import { NextResponse } from "next/server";
import { getRecord } from "@/lib/db";
import { recordsToCsv } from "@/lib/csv";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const record = await getRecord(params.id);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const csv = recordsToCsv([record]);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="disclosure-${record.id}.csv"`,
    },
  });
}
