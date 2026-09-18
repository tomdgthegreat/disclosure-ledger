"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

type Phase = "idle" | "sending" | "sent" | "error";

export function LoginForm({
  initialEmail = "",
  verified = false,
  errorCode = null,
}: {
  initialEmail?: string;
  verified?: boolean;
  errorCode?: string | null;
}) {
  const t = useTranslations("login");
  const locale = useLocale();
  const [email, setEmail] = useState(initialEmail);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const banner = useMemo(() => {
    if (verified) return { kind: "ok" as const, text: t("verified") };
    if (!errorCode) return null;
    const key =
      errorCode === "expired"
        ? "errorExpired"
        : errorCode === "used"
          ? "errorUsed"
          : errorCode === "auth_misconfigured"
            ? "errorMisconfigured"
            : "errorInvalid";
    return { kind: "err" as const, text: t(key) };
  }, [verified, errorCode, t]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError(t("emailRequired"));
      return;
    }
    setPhase("sending");
    try {
      const res = await fetch("/api/auth/magic/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, locale }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        ok?: boolean;
      };
      if (res.status === 429) {
        setError(data.message ?? t("rateLimited"));
        setPhase("error");
        return;
      }
      if (!res.ok) {
        throw new Error(data.message ?? data.error ?? t("failed"));
      }
      setPhase("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failed"));
      setPhase("error");
    }
  }

  return (
    <div className="space-y-6">
      {banner && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            banner.kind === "ok"
              ? "bg-azure-soft/80 text-azure-deep"
              : "bg-coral-soft text-[#b8321a]"
          }`}
        >
          {banner.text}
        </p>
      )}

      {phase === "sent" ? (
        <div className="card-tinted space-y-3 p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-ink">{t("checkTitle")}</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            {t("checkBody", { email: email.trim() })}
          </p>
          <p className="text-xs text-ink-muted">{t("checkHint")}</p>
          <button
            type="button"
            className="btn-secondary mt-2"
            onClick={() => setPhase("idle")}
          >
            {t("sendAnother")}
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card-tinted space-y-5 p-6 sm:p-7">
          <div>
            <label htmlFor="login-email" className="text-sm font-semibold text-ink">
              {t("email")}
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border-0 bg-white/80 px-3 py-2.5 text-sm text-ink shadow-[0_2px_8px_rgba(26,108,255,0.08)] focus:outline-none focus:ring-2 focus:ring-azure/35"
              placeholder={t("emailPlaceholder")}
              disabled={phase === "sending"}
            />
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              {t("honest")}
            </p>
          </div>

          {(error || phase === "error") && error && (
            <p className="rounded-2xl bg-coral-soft px-3 py-2 text-sm font-medium text-[#b8321a]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={phase === "sending"}
            className="btn-primary w-full disabled:opacity-60"
          >
            {phase === "sending" ? t("sending") : t("submit")}
          </button>

          <p className="text-xs text-ink-muted">
            {t.rich("privacyNote", {
              privacy: (chunks) => (
                <Link href="/privacy" className="underline hover:text-ink">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </form>
      )}
    </div>
  );
}
