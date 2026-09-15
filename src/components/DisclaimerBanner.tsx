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
      ? "border-azure/35 bg-ink-soft text-cream"
      : "border-amber/40 bg-amber-soft/90 text-ink shadow-sm";
  const bodyTone =
    variant === "inverse" ? "text-cream/80" : "text-ink-muted";
  const dot =
    variant === "inverse" ? "bg-coral-bright" : "bg-amber";

  return (
    <aside
      className={`rounded-2xl border px-4 py-3.5 text-sm ${shell} ${className}`}
      role="note"
    >
      <p className="flex items-center gap-2 font-semibold tracking-tight">
        <span
          className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dot}`}
          aria-hidden
        />
        {t("title")}
      </p>
      <p className={`mt-1.5 leading-relaxed ${bodyTone}`}>{t("body")}</p>
    </aside>
  );
}
