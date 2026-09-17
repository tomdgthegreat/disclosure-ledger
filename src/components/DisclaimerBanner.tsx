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
      ? "border-0 bg-white/10 text-cream backdrop-blur-sm"
      : "border-0 bg-gradient-to-r from-amber-soft to-coral-soft/80 text-ink shadow-[0_6px_20px_rgba(255,176,32,0.2)]";
  const bodyTone =
    variant === "inverse" ? "text-cream/80" : "text-ink-muted";
  const dot =
    variant === "inverse" ? "bg-coral-bright" : "bg-coral";

  return (
    <aside
      className={`rounded-3xl px-4 py-3.5 text-sm ${shell} ${className}`}
      role="note"
    >
      <p className="flex items-center gap-2 font-semibold tracking-tight">
        <span
          className={`inline-block h-2 w-2 shrink-0 rounded-full ${dot} shadow-[0_0_0_3px_rgba(255,90,60,0.25)]`}
          aria-hidden
        />
        {t("title")}
      </p>
      <p className={`mt-1.5 leading-relaxed ${bodyTone}`}>{t("body")}</p>
    </aside>
  );
}
