"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { DisclaimerBanner } from "./DisclaimerBanner";

type Phase = "idle" | "running" | "gated" | "error" | "done";

type PublicFinding = {
  id: string;
  kind: string;
  severity: string;
  pageUrl?: string;
  assetUrl?: string;
  message: string;
};

type PublicScan = {
  id: string;
  createdAt: string;
  targetUrl: string;
  status: string;
  pagesCrawled: number;
  imagesChecked: number;
  findingCount: number;
  findings: PublicFinding[];
  summary?: { truncated?: boolean; host?: string };
};

export function ScanForm() {
  const t = useTranslations("scan");
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [gateMessage, setGateMessage] = useState<string | null>(null);
  const [scan, setScan] = useState<PublicScan | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGateMessage(null);
    setScan(null);
    if (!url.trim()) {
      setError(t("urlRequired"));
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError(t("emailRequired"));
      return;
    }
    setPhase("running");
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          contactEmail: email.trim(),
        }),
      });
      const data = (await res.json()) as {
        scan?: PublicScan;
        gated?: boolean;
        error?: string;
        message?: string;
      };
      if (res.status === 402 || data.gated || data.error === "free_scan_exhausted") {
        setGateMessage(data.message ?? t("gatedDefault"));
        setPhase("gated");
        return;
      }
      if (res.status === 429) {
        setGateMessage(data.message ?? t("cooldownDefault"));
        setPhase("gated");
        return;
      }
      if (!res.ok || !data.scan) {
        throw new Error(data.message ?? data.error ?? t("failed"));
      }
      setScan(data.scan);
      setPhase("done");
      router.push(`/scan/${data.scan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failed"));
      setPhase("error");
    }
  }

  async function startCheckout() {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setGateMessage(t("emailRequired"));
      return;
    }
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed }),
    });
    const data = (await res.json()) as {
      url?: string | null;
      message?: string;
    };
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setGateMessage(data.message ?? t("stripeNotConfigured"));
  }

  return (
    <div className="space-y-6">
      <DisclaimerBanner />
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-azure/20 bg-white/95 p-6 shadow-card"
      >
        <label className="block text-sm font-semibold text-ink">
          {t("urlLabel")}
          <input
            type="url"
            required
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-azure/25 bg-cream/80 px-3 py-2.5 text-sm text-ink outline-none ring-azure/30 focus:ring-2"
            disabled={phase === "running"}
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-ink">
          {t("emailLabel")}
          <input
            type="email"
            required
            placeholder="you@agency.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-azure/25 bg-cream/80 px-3 py-2.5 text-sm text-ink outline-none ring-azure/30 focus:ring-2"
            disabled={phase === "running"}
          />
        </label>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">{t("fairUse")}</p>
        <button
          type="submit"
          className="btn-coral mt-5 w-full sm:w-auto"
          disabled={phase === "running"}
        >
          {phase === "running" ? t("running") : t("submit")}
        </button>
        {error && (
          <p className="mt-3 rounded-xl bg-coral-soft/80 px-3 py-2 text-sm text-ink">
            {error}
          </p>
        )}
      </form>

      {phase === "gated" && (
        <div className="rounded-2xl border border-amber/40 bg-amber-soft/60 p-5">
          <p className="text-sm font-semibold text-ink">{t("gatedTitle")}</p>
          <p className="mt-2 text-sm text-ink-muted">{gateMessage}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-coral" onClick={startCheckout}>
              {t("checkout")}
            </button>
            <Link href="/pricing" className="btn-primary">
              {t("seePricing")}
            </Link>
          </div>
        </div>
      )}

      {scan && phase === "done" && (
        <div className="rounded-2xl border border-azure/20 bg-white/95 p-5 text-sm text-ink-muted">
          {t("redirecting", { id: scan.id })}
        </div>
      )}
    </div>
  );
}
