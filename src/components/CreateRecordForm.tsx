"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
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
        className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-slate-400"
      >
        <p className="text-sm font-medium text-slate-800">{t("dropTitle")}</p>
        <p className="mt-1 text-xs text-slate-500">{t("dropHint")}</p>
        <label className="mt-4 inline-block cursor-pointer rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200">
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
            className="mx-auto mt-4 max-h-48 rounded-lg border border-slate-200 object-contain"
          />
        )}
        {phase === "hashing" && (
          <p className="mt-3 text-sm text-slate-600">{t("hashing")}</p>
        )}
      </div>

      {hash && provenance && (
        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {t("hashTitle")}
            </h3>
            <code className="mt-1 block break-all rounded bg-slate-50 p-2 text-xs text-slate-700">
              {hash}
            </code>
            <p className="mt-1 text-xs text-slate-500">
              {file?.name} · {file?.size.toLocaleString()} bytes ·{" "}
              {file?.type || "unknown type"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {t("provTitle")}
            </h3>
            <p className="mt-1 text-sm text-slate-700">
              {provenance.found ? t("provFound") : t("provNone")}
            </p>
            <p className="mt-1 text-xs text-slate-500">{provenance.details}</p>
            {provenance.signals.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs text-slate-600">
                {provenance.signals.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs italic text-slate-500">
              {t("method", { method: provenance.method })}
            </p>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-slate-900">
              {t("declareLegend")}
            </legend>
            <p className="mt-1 text-xs text-slate-500">{t("declareHint")}</p>
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
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    aiDeclaration === value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-800"
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
              className="text-sm font-semibold text-slate-900"
            >
              {t("notes")}
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              rows={3}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder={t("notesPlaceholder")}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-900"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder={t("emailPlaceholder")}
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          {phase === "gated" && (
            <div className="space-y-3 rounded-md border border-slate-300 bg-slate-50 p-4">
              <p className="text-sm text-slate-800">
                {gateMessage ?? t("gatedDefault")}
              </p>
              <button
                type="button"
                onClick={() => void startCheckout()}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {t("checkout")}
              </button>
              <p className="text-xs text-slate-500">{t("checkoutStub")}</p>
            </div>
          )}

          {phase !== "gated" && (
            <button
              type="submit"
              disabled={phase === "submitting"}
              className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {phase === "submitting" ? t("submitting") : t("submit")}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
