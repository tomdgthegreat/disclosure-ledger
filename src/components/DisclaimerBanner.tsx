"use client";

import { useTranslations } from "next-intl";

export function DisclaimerBanner({ className = "" }: { className?: string }) {
  const t = useTranslations("disclaimer");
  return (
    <aside
      className={`rounded-lg border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 ${className}`}
      role="note"
    >
      <p className="font-semibold">{t("title")}</p>
      <p className="mt-1 leading-relaxed">{t("body")}</p>
    </aside>
  );
}
