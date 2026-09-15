import type { DisclosureRecord } from "./types";

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Serialize records to CSV.
 * @param publicExport default true — omits contactEmail from headers and rows.
 * Ops may pass `{ public: false }` to include contactEmail.
 */
export function recordsToCsv(
  records: DisclosureRecord[],
  options?: { public?: boolean }
): string {
  const isPublic = options?.public !== false;
  const headers = [
    "id",
    "createdAt",
    "contentHashSha256",
    "fileName",
    "fileSizeBytes",
    "mimeType",
    "aiDeclaration",
    "notes",
    ...(isPublic ? [] : ["contactEmail"]),
    "provenanceFound",
    "provenanceMethod",
    "provenanceDetails",
    "provenanceSignals",
  ];
  const lines = [headers.join(",")];
  for (const r of records) {
    const cells = [
      r.id,
      r.createdAt,
      r.contentHashSha256,
      r.fileName,
      String(r.fileSizeBytes),
      r.mimeType,
      r.aiDeclaration,
      r.notes,
      ...(isPublic ? [] : [r.contactEmail ?? ""]),
      r.provenance.found ? "true" : "false",
      r.provenance.method,
      r.provenance.details,
      r.provenance.signals.join("; "),
    ];
    lines.push(cells.map(escapeCsv).join(","));
  }
  return lines.join("\n") + "\n";
}
