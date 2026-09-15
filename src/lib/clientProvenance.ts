import type { ProvenanceSummary } from "./types";

/**
 * Best-effort, honest provenance probe — NOT a C2PA verifier.
 * Scans file bytes for common Content Credentials / C2PA / JUMBF markers
 * and a few EXIF-ish strings. Absence of signals does not prove absence of AI.
 */
export async function probeProvenance(file: File): Promise<ProvenanceSummary> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const textSample = extractAsciiSample(bytes, 512_000);

  const signals: string[] = [];

  const markerChecks: { label: string; needle: string }[] = [
    { label: "c2pa string", needle: "c2pa" },
    { label: "jumbf box hint", needle: "jumbf" },
    { label: "contentcredentials", needle: "contentcredentials" },
    { label: "claim.signature hint", needle: "c2pa.signature" },
    { label: "adobe.provenance hint", needle: "adobe.provenance" },
    { label: "xmp GPano/AI hint", needle: "GeneratedWithAI" },
    { label: "photoshop digsig", needle: "Adobe.Photoshop" },
  ];

  const lower = textSample.toLowerCase();
  for (const check of markerChecks) {
    if (lower.includes(check.needle.toLowerCase())) {
      signals.push(check.label);
    }
  }

  // JPEG APP1 / TIFF-ish magic
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    signals.push("jpeg container detected");
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    signals.push("png container detected");
  }

  // Look for PNG iTXt/tEXt chunk names containing "c2pa" / "XML:com.adobe.xmp"
  if (lower.includes("xml:com.adobe.xmp")) {
    signals.push("adobe xmp packet hint");
  }

  const provenanceSignals = signals.filter(
    (s) =>
      !s.includes("container detected") &&
      s !== "photoshop digsig" &&
      s !== "adobe xmp packet hint"
  );

  if (provenanceSignals.length > 0) {
    return {
      found: true,
      method: "best-effort byte/string scan (not C2PA validation)",
      details:
        "Possible provenance-related markers were found in file bytes. This app does not validate signatures, claim chains, or authenticity. Treat as a hint only.",
      signals,
    };
  }

  if (signals.length > 0) {
    return {
      found: false,
      method: "best-effort byte/string scan (not C2PA validation)",
      details:
        "Container or generic metadata hints were present, but no clear C2PA/Content Credentials markers were detected. Provenance may still exist in forms this MVP does not parse.",
      signals,
    };
  }

  return {
    found: false,
    method: "best-effort byte/string scan (not C2PA validation)",
    details:
      "No embedded C2PA/Content Credentials markers detected by this limited scan. Many publishing pipelines strip provenance. Absence of markers is not proof of anything.",
    signals: [],
  };
}

function extractAsciiSample(bytes: Uint8Array, maxLen: number): string {
  const len = Math.min(bytes.length, maxLen);
  const chars: string[] = [];
  for (let i = 0; i < len; i++) {
    const b = bytes[i];
    if (b >= 32 && b <= 126) {
      chars.push(String.fromCharCode(b));
    } else {
      chars.push(" ");
    }
  }
  return chars.join("");
}
