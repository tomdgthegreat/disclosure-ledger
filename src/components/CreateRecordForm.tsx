"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { sha256File } from "@/lib/clientHash";
import { probeProvenance } from "@/lib/clientProvenance";
import type { AiDeclaration, ProvenanceSummary } from "@/lib/types";
import { DisclaimerBanner } from "./DisclaimerBanner";

type Phase =
  | "idle"
  | "hashing"
  | "ready"
  | "submitting"
  | "gated"
  | "error";

export function CreateRecordForm() {
  const t = useTranslations("form");
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string>("");
  const [provenance, setProvenance] = useState<ProvenanceSummary | null>(null);
  const [aiDeclaration, setAiDeclaration] = useState<AiDeclaration>("no");
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [gateMessage, setGateMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onFile = useCallback(
    async (f: File | null) => {
      setError(null);
      setGateMessage(null);
      if (!f) {
        setFile(null);
        setHash("");
        setProvenance(null);
        setPreviewUrl(null);
        setPhase("idle");
        return;
      }
      if (!f.type.startsWith("image/")) {
        setError(t("needImage"));
        return;
      }
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setPhase("hashing");
      try {
        const [h, prov] = await Promise.all([
          sha256File(f),
          probeProvenance(f),
        ]);
        setHash(h);
        setProvenance(prov);
        setPhase("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to process file");
        setPhase("error");
      }
    },
    [t]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0] ?? null;
      void onFile(f);
    },
    [onFile]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !provenance || !hash) return;
    setPhase("submitting");
    setError(null);
    setGateMessage(null);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentHashSha256: hash,
          fileName: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type || "application/octet-stream",
          aiDeclaration,
          notes,
          contactEmail: email || null,
          provenance,
        }),
      });
      const data = (await res.json()) as {
        record?: { id: string };
        error?: string;
        gated?: boolean;
        message?: string;
      };
      if (res.status === 402 || data.gated) {
        setGateMessage(data.message ?? t("gatedDefault"));
        setPhase("gated");
        return;
      }
      if (!res.ok || !data.record) {
        throw new Error(data.error ?? "Failed to create record");
      }
      router.push(`/r/${data.record.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
      setPhase("error");
    }
  }

  async function startCheckout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || undefined }),
    });
    const data = (await res.json()) as {
      url?: string | null;
      stub?: boolean;
      message?: string;
    };
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setGateMessage(
      data.message ??
        "Stripe Checkout is stubbed. Configure STRIPE_SECRET_KEY and STRIPE_PRICE_ID."
    );
  }

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-3xl bg-gradient-to-br from-azure-soft via-azure-soft/50 to-coral-soft/40 p-8 text-center shadow-[0_8px_32px_rgba(26,108,255,0.14)] ring-2 ring-dashed ring-azure/35 transition hover:from-azure-soft hover:to-coral-soft/60 hover:ring-azure/60"
      >
        <p className="text-sm font-medium text-ink">{t("dropTitle")}</p>
        <p className="mt-1 text-xs text-ink-muted">{t("dropHint")}</p>
        <label className="btn-secondary mt-4 cursor-pointer !px-4 !py-2">
          {t("chooseFile")}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={t("previewAlt")}
            className="mx-auto mt-4 max-h-48 rounded-2xl object-contain shadow-[0_8px_24px_rgba(26,108,255,0.2)]"
          />
        )}
        {phase === "hashing" && (
          <p className="mt-3 text-sm text-ink-muted">{t("hashing")}</p>
        )}
      </div>

      {hash && provenance && (
        <form
          onSubmit={onSubmit}
          className="card-tinted space-y-5 p-6 sm:p-7"
        >
          <div>
            <h3 className="text-sm font-semibold text-ink">
              {t("hashTitle")}
            </h3>
            <code className="mt-1 block break-all rounded-lg bg-azure-soft/60 p-2 text-xs text-ink-muted">
              {hash}
            </code>
            <p className="mt-1 text-xs text-ink-muted">
              {file?.name} · {file?.size.toLocaleString()} bytes ·{" "}
              {file?.type || "unknown type"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">
              {t("provTitle")}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              {provenance.found ? t("provFound") : t("provNone")}
            </p>
            <p className="mt-1 text-xs text-ink-muted">{provenance.details}</p>
            {provenance.signals.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs text-ink-muted">
                {provenance.signals.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs italic text-ink-muted">
              {t("method", { method: provenance.method })}
            </p>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-ink">
              {t("declareLegend")}
            </legend>
            <p className="mt-1 text-xs text-ink-muted">{t("declareHint")}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {(
                [
                  ["no", "aiNo"],
                  ["yes", "aiYes"],
                  ["partial", "aiPartial"],
                ] as const
              ).map(([value, key]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    aiDeclaration === value
                      ? "bg-azure text-white shadow-[0_6px_16px_rgba(26,108,255,0.4)]"
                      : "bg-white/70 text-ink shadow-sm hover:bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="ai"
                    value={value}
                    checked={aiDeclaration === value}
                    onChange={() => setAiDeclaration(value)}
                    className="sr-only"
                  />
                  {t(key)}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="notes"
              className="text-sm font-semibold text-ink"
            >
              {t("notes")}
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              rows={3}
              className="mt-1 w-full rounded-2xl border-0 bg-white/80 px-3 py-2.5 text-sm text-ink shadow-[0_2px_8px_rgba(26,108,255,0.08)] focus:outline-none focus:ring-2 focus:ring-azure/35"
              placeholder={t("notesPlaceholder")}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-ink"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border-0 bg-white/80 px-3 py-2.5 text-sm text-ink shadow-[0_2px_8px_rgba(26,108,255,0.08)] focus:outline-none focus:ring-2 focus:ring-azure/35"
              placeholder={t("emailPlaceholder")}
            />
            <p className="mt-1 text-xs text-ink-muted">
              {t.rich("emailPrivacy", {
                privacy: (chunks) => (
                  <Link href="/privacy" className="underline hover:text-ink">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>

          {error && (
            <p className="rounded-2xl bg-coral-soft px-3 py-2 text-sm font-medium text-[#b8321a]">
              {error}
            </p>
          )}

          {phase === "gated" && (
            <div className="space-y-3 rounded-3xl bg-gradient-to-br from-coral-soft to-amber-soft/60 p-5 shadow-[0_8px_24px_rgba(255,90,60,0.18)]">
              <p className="text-sm text-ink">
                {gateMessage ?? t("gatedDefault")}
              </p>
              <button
                type="button"
                onClick={() => void startCheckout()}
                className="btn-primary !rounded-full"
              >
                {t("checkout")}
              </button>
              <p className="text-xs text-ink-muted">{t("checkoutStub")}</p>
            </div>
          )}

          {phase !== "gated" && (
            <button
              type="submit"
              disabled={phase === "submitting"}
              className="btn-primary w-full disabled:opacity-60"
            >
              {phase === "submitting" ? t("submitting") : t("submit")}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
