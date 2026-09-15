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

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="flex items-center gap-1 text-sm text-slate-600">
      <span className="sr-only">Language</span>
      <select
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800"
        value={locale}
        onChange={(e) => {
          const next = e.target.value as (typeof routing.locales)[number];
          router.replace(pathname, { locale: next });
        }}
        aria-label="Language"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {LABELS[l] ?? l.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
