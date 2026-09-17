"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter, routing } from "@/i18n/routing";

const LABELS: Record<string, string> = {
  en: "EN",
  de: "DE",
  fr: "FR",
  it: "IT",
  es: "ES",
  pl: "PL",
};

export function LanguageSwitcher({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const shell =
    variant === "dark"
      ? "border-white/25 bg-white/10 text-white"
      : "border-azure/30 bg-white/90 text-ink shadow-[0_2px_10px_rgba(26,108,255,0.1)]";

  return (
    <label
      className={`flex items-center gap-1 text-sm ${
        variant === "dark" ? "text-white/70" : "text-ink-muted"
      }`}
    >
      <span className="sr-only">Language</span>
      <select
        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${shell}`}
        value={locale}
        onChange={(e) => {
          const next = e.target.value as (typeof routing.locales)[number];
          router.replace(pathname, { locale: next });
        }}
        aria-label="Language"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l} className="text-ink">
            {LABELS[l] ?? l.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
