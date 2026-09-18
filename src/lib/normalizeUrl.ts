/**
 * Accept bare domains like example.com or www.example.com.
 * Prepends https:// when no scheme is present. Safe for client + server.
 */
export function normalizePublicSiteUrl(raw: string): string {
  let s = raw.trim();
  if (!s) return s;
  s = s.replace(/^<|>$/g, "").trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) {
    return s;
  }
  if (s.startsWith("//")) {
    return `https:${s}`;
  }
  return `https://${s}`;
}
