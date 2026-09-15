import type { DisclosureRecord } from "./types";

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function recordsToCsv(records: DisclosureRecord[]): string {
  const headers = [
    "id",
    "createdAt",
    "contentHashSha256",
    "fileName",
    "fileSizeBytes",
    "mimeType",
    "aiDeclaration",
    "notes",
    "contactEmail",
    "provenanceFound",
    "provenanceMethod",
    "provenanceDetails",
    "provenanceSignals",
  ];
  const lines = [headers.join(",")];
  for (const r of records) {
    lines.push(
      [
        r.id,
        r.createdAt,
        r.contentHashSha256,
        r.fileName,
        String(r.fileSizeBytes),
        r.mimeType,
        r.aiDeclaration,
        r.notes,
        r.contactEmail ?? "",
        r.provenance.found ? "true" : "false",
        r.provenance.method,
        r.provenance.details,
        r.provenance.signals.join("; "),
      ]
        .map(escapeCsv)
        .join(",")
    );
  }
  return lines.join("\n") + "\n";
}
