/**
 * Public-site hygiene crawl — OBSERVABLE possible disclosure gaps only.
 * Not an audit, compliance check, or Art. 50 certification.
 * SSRF-safe: http(s) only, block private/link-local/localhost, same-host only, timeouts.
 */

import dns from "dns/promises";
import net from "net";
import { URL } from "url";
import { normalizePublicSiteUrl } from "@/lib/normalizeUrl";

export type ScanFindingKind =
  | "no_nearby_disclosure"
  | "no_ledger_link"
  | "missing_provenance_hints";

export type CrawlFinding = {
  kind: ScanFindingKind;
  severity: "review";
  pageUrl?: string;
  assetUrl?: string;
  message: string;
  evidence?: Record<string, unknown>;
};

export type CrawlLimits = {
  maxPages: number;
  maxImages: number;
  /** Per-request timeout ms */
  fetchTimeoutMs: number;
  /** Soft overall budget ms */
  overallBudgetMs: number;
};

export type CrawlResult = {
  status: "completed" | "failed";
  pagesCrawled: number;
  imagesChecked: number;
  findings: CrawlFinding[];
  summary: {
    targetUrl: string;
    host: string;
    limits: CrawlLimits;
    pagesVisited: string[];
    truncated: boolean;
    error?: string;
    robotsDisallowHints: string[];
  };
};

const DISCLOSURE_PATTERNS = [
  /\bai[- ]?(generated|created|assisted|disclosure|notice|label)\b/i,
  /\bmachine[- ]?generated\b/i,
  /\bsynthetic\s+(image|media|content)\b/i,
  /\bcontent\s+credentials?\b/i,
  /\bthis\s+(image|media|content)\s+(was|is)\s+(ai|artificially)/i,
  /\bgenerated\s+with\s+ai\b/i,
  /\bdisclosure\s+(notice|statement|label)\b/i,
  /\beu\s+ai\s+act\b/i,
  /\barticle\s*50\b/i,
  /\btransparenz\b/i,
  /\bki[- ]?(generiert|hinweis|kennzeichnung)\b/i,
];

const LEDGER_LINK_RE =
  /discloseledger\.com\/r\/[a-zA-Z0-9_-]+|discloseledger\.com\/[a-z]{2}\/r\/[a-zA-Z0-9_-]+/i;

const PROVENANCE_NEEDLES = [
  "c2pa",
  "jumbf",
  "contentcredentials",
  "c2pa.signature",
  "adobe.provenance",
  "generatedwithai",
  "xml:com.adobe.xmp",
];

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif)(\?|#|$)/i;

function isPrivateOrLocalIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (!family) return true;

  if (family === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast / reserved
    return false;
  }

  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // ULA
  if (normalized.startsWith("fe80")) return true; // link-local
  if (normalized.startsWith("::ffff:")) {
    const v4 = normalized.slice(7);
    return isPrivateOrLocalIp(v4);
  }
  return false;
}

function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, "");
  if (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h === "0.0.0.0" ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h.endsWith(".lan")
  ) {
    return true;
  }
  if (net.isIP(h) && isPrivateOrLocalIp(h)) return true;
  return false;
}


export async function assertSafePublicHttpUrl(
  raw: string
): Promise<{ ok: true; url: URL } | { ok: false; error: string }> {
  let parsed: URL;
  try {
    parsed = new URL(normalizePublicSiteUrl(raw));
  } catch {
    return { ok: false, error: "Invalid URL" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only http(s) URLs are allowed" };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, error: "URLs with credentials are not allowed" };
  }
  if (isBlockedHostname(parsed.hostname)) {
    return { ok: false, error: "Private or local hostnames are not allowed" };
  }
  if (net.isIP(parsed.hostname)) {
    if (isPrivateOrLocalIp(parsed.hostname)) {
      return { ok: false, error: "Private or link-local IPs are not allowed" };
    }
    return { ok: true, url: parsed };
  }
  try {
    const records = await dns.lookup(parsed.hostname, { all: true });
    if (!records.length) {
      return { ok: false, error: "Could not resolve hostname" };
    }
    for (const r of records) {
      if (isPrivateOrLocalIp(r.address)) {
        return {
          ok: false,
          error: "Hostname resolves to a private or link-local address",
        };
      }
    }
  } catch {
    return { ok: false, error: "DNS lookup failed" };
  }
  return { ok: true, url: parsed };
}

function sameHost(a: URL, b: URL): boolean {
  return a.hostname.toLowerCase() === b.hostname.toLowerCase();
}

function absolutize(base: URL, href: string): URL | null {
  try {
    const u = new URL(href, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "DisclosureLedgerHygieneBot/1.0 (+https://discloseledger.com/scan; polite public crawl)",
        Accept: "*/*",
        ...(init?.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function extractAsciiSample(bytes: Uint8Array, maxLen: number): string {
  const n = Math.min(bytes.length, maxLen);
  let out = "";
  for (let i = 0; i < n; i++) {
    const c = bytes[i];
    if (c >= 32 && c < 127) out += String.fromCharCode(c);
    else if (c === 9 || c === 10 || c === 13) out += " ";
  }
  return out;
}

function sniffProvenanceHints(bytes: Uint8Array): {
  hasHints: boolean;
  signals: string[];
} {
  const sample = extractAsciiSample(bytes, 256_000).toLowerCase();
  const signals: string[] = [];
  for (const needle of PROVENANCE_NEEDLES) {
    if (sample.includes(needle)) signals.push(needle);
  }
  // PNG / JPEG magic alone is not a provenance hint
  return { hasHints: signals.length > 0, signals };
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function pageHasDisclosureNotice(html: string, text: string): boolean {
  const hay = `${html}\n${text}`;
  return DISCLOSURE_PATTERNS.some((re) => re.test(hay));
}

function pageHasLedgerLink(html: string): boolean {
  return LEDGER_LINK_RE.test(html);
}

function extractLinks(html: string, base: URL): string[] {
  const hrefs: string[] = [];
  const re = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const abs = absolutize(base, m[1]);
    if (!abs) continue;
    if (!sameHost(abs, base)) continue;
    abs.hash = "";
    hrefs.push(abs.toString());
  }
  return hrefs;
}

function extractImageUrls(html: string, base: URL): string[] {
  const urls: string[] = [];
  const re = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const abs = absolutize(base, m[1]);
    if (!abs) continue;
    if (!sameHost(abs, base)) continue;
    if (!IMAGE_EXT_RE.test(abs.pathname) && !abs.pathname.includes("/image")) {
      // still allow common CDN paths without extension
      if (!/\.(jpe?g|png|webp|gif)/i.test(abs.href)) {
        // skip likely non-image (svg icons often ok to skip)
        if (abs.pathname.endsWith(".svg")) continue;
      }
    }
    abs.hash = "";
    urls.push(abs.toString());
  }
  // also og:image
  const og = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
  while ((m = og.exec(html))) {
    const abs = absolutize(base, m[1]);
    if (abs && sameHost(abs, base)) urls.push(abs.toString());
  }
  return Array.from(new Set(urls));
}

async function loadRobotsDisallow(
  origin: URL,
  timeoutMs: number
): Promise<string[]> {
  try {
    const robotsUrl = new URL("/robots.txt", origin).toString();
    const res = await fetchWithTimeout(robotsUrl, Math.min(timeoutMs, 5000));
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.split(/\r?\n/);
    const disallows: string[] = [];
    let applies = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const lower = trimmed.toLowerCase();
      if (lower.startsWith("user-agent:")) {
        const ua = trimmed.slice(11).trim();
        applies = ua === "*" || /disclosureledger/i.test(ua);
        continue;
      }
      if (!applies) continue;
      if (lower.startsWith("disallow:")) {
        const path = trimmed.slice(9).trim();
        if (path) disallows.push(path);
      }
    }
    return disallows;
  } catch {
    return [];
  }
}

function isDisallowed(pathname: string, disallows: string[]): boolean {
  for (const d of disallows) {
    if (d === "/") return true;
    if (pathname.startsWith(d)) return true;
  }
  return false;
}

export async function runHygieneCrawl(
  targetRaw: string,
  limits: CrawlLimits
): Promise<CrawlResult> {
  const started = Date.now();
  const safe = await assertSafePublicHttpUrl(targetRaw);
  if (!safe.ok) {
    return {
      status: "failed",
      pagesCrawled: 0,
      imagesChecked: 0,
      findings: [],
      summary: {
        targetUrl: targetRaw,
        host: "",
        limits,
        pagesVisited: [],
        truncated: false,
        error: safe.error,
        robotsDisallowHints: [],
      },
    };
  }

  const startUrl = safe.url;
  startUrl.hash = "";
  const originHost = startUrl.hostname.toLowerCase();
  const robotsDisallow = await loadRobotsDisallow(
    startUrl,
    limits.fetchTimeoutMs
  );

  const queue: string[] = [startUrl.toString()];
  const visited = new Set<string>();
  const imageSeen = new Set<string>();
  const findings: CrawlFinding[] = [];
  let pagesCrawled = 0;
  let imagesChecked = 0;
  let truncated = false;

  while (queue.length > 0) {
    if (Date.now() - started > limits.overallBudgetMs) {
      truncated = true;
      break;
    }
    if (pagesCrawled >= limits.maxPages) {
      truncated = true;
      break;
    }

    const next = queue.shift()!;
    if (visited.has(next)) continue;
    visited.add(next);

    let pageUrl: URL;
    try {
      pageUrl = new URL(next);
    } catch {
      continue;
    }
    if (pageUrl.hostname.toLowerCase() !== originHost) continue;
    if (isDisallowed(pageUrl.pathname, robotsDisallow)) continue;

    // Re-check DNS safety for redirects is handled by fetch follow; block IP hosts
    const reSafe = await assertSafePublicHttpUrl(pageUrl.toString());
    if (!reSafe.ok) continue;

    let html: string;
    try {
      const res = await fetchWithTimeout(
        pageUrl.toString(),
        limits.fetchTimeoutMs,
        { headers: { Accept: "text/html,application/xhtml+xml" } }
      );
      const ct = res.headers.get("content-type") || "";
      if (!res.ok || !ct.includes("text/html")) continue;
      // Cap HTML size ~1.5MB
      const buf = Buffer.from(await res.arrayBuffer());
      html = buf.subarray(0, 1_500_000).toString("utf8");
    } catch {
      continue;
    }

    pagesCrawled += 1;
    const text = stripTags(html);
    const hasNotice = pageHasDisclosureNotice(html, text);
    const hasLedger = pageHasLedgerLink(html);

    if (!hasNotice) {
      findings.push({
        kind: "no_nearby_disclosure",
        severity: "review",
        pageUrl: pageUrl.toString(),
        message:
          "Possible gap to review: no nearby AI / disclosure notice wording was observed on this public page.",
        evidence: { heuristic: "keyword_patterns" },
      });
    }
    if (!hasLedger) {
      findings.push({
        kind: "no_ledger_link",
        severity: "review",
        pageUrl: pageUrl.toString(),
        message:
          "Possible gap to review: no Disclosure Ledger record link (discloseledger.com/r/…) was observed on this public page.",
        evidence: { heuristic: "ledger_link_pattern" },
      });
    }

    const images = extractImageUrls(html, pageUrl);
    for (const imgUrl of images) {
      if (imagesChecked >= limits.maxImages) {
        truncated = true;
        break;
      }
      if (imageSeen.has(imgUrl)) continue;
      imageSeen.add(imgUrl);
      if (Date.now() - started > limits.overallBudgetMs) {
        truncated = true;
        break;
      }

      const imgSafe = await assertSafePublicHttpUrl(imgUrl);
      if (!imgSafe.ok) continue;
      if (imgSafe.url.hostname.toLowerCase() !== originHost) continue;

      try {
        const res = await fetchWithTimeout(
          imgUrl,
          limits.fetchTimeoutMs,
          { headers: { Accept: "image/*,*/*" } }
        );
        if (!res.ok) continue;
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        if (
          ct &&
          !ct.startsWith("image/") &&
          !ct.includes("octet-stream")
        ) {
          continue;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        // Cap sniff to 512KB
        const slice = buf.subarray(0, 512_000);
        imagesChecked += 1;
        const sniff = sniffProvenanceHints(slice);
        if (!sniff.hasHints) {
          findings.push({
            kind: "missing_provenance_hints",
            severity: "review",
            pageUrl: pageUrl.toString(),
            assetUrl: imgUrl,
            message:
              "Possible gap to review: no lightweight provenance metadata hints (PNG/JPEG/XMP/C2PA string markers) were readable in this public image.",
            evidence: {
              method: "byte_string_sniff",
              note: "Not a C2PA validator; absence of markers is not proof of AI or non-AI content.",
            },
          });
        }
      } catch {
        // skip failed image fetches
      }
    }

    if (pagesCrawled < limits.maxPages) {
      for (const link of extractLinks(html, pageUrl)) {
        if (!visited.has(link) && !queue.includes(link)) {
          try {
            const u = new URL(link);
            if (isDisallowed(u.pathname, robotsDisallow)) continue;
          } catch {
            continue;
          }
          queue.push(link);
        }
      }
    }
  }

  return {
    status: "completed",
    pagesCrawled,
    imagesChecked,
    findings,
    summary: {
      targetUrl: startUrl.toString(),
      host: originHost,
      limits,
      pagesVisited: Array.from(visited).slice(0, 50),
      truncated,
      robotsDisallowHints: robotsDisallow.slice(0, 20),
    },
  };
}
