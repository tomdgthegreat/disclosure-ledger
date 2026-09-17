import { NextResponse } from "next/server";
import { getScan, toPublicScan } from "@/lib/scanStore";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const scan = await getScan(params.id);
  if (!scan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    scan: toPublicScan(scan),
    disclaimer:
      "Results list possible disclosure gaps to review only — not an audit, compliance opinion, or Art. 50 certification.",
  });
}
