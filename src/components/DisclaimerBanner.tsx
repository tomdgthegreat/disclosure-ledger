"use client";

import { useTranslations } from "next-intl";

export function DisclaimerBanner({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "inverse";
}) {
  const t = useTranslations("disclaimer");
  const shell =
    variant === "inverse"
      ? "border-gold/40 bg-ink-soft text-cream"
      : "border-gold/35 bg-gold-soft/90 text-ink shadow-sm";
  const bodyTone =
    variant === "inverse" ? "text-cream/80" : "text-ink-muted";

  return (
    <aside
      className={`rounded-2xl border px-4 py-3.5 text-sm ${shell} ${className}`}
      role="note"
    >
      <p className="flex items-center gap-2 font-semibold tracking-tight">
        <span
          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
          aria-hidden
        />
        {t("title")}
      </p>
      <p className={`mt-1.5 leading-relaxed ${bodyTone}`}>{t("body")}</p>
    </aside>
  );
}
