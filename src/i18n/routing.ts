import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

/**
 * Locale scheme (documented):
 * - Default locale `en` uses no prefix (`/`, `/pricing`, …) — localePrefix: "as-needed"
 * - Other locales: `/de`, `/fr`, `/it`, `/es`, `/pl` (+ same paths)
 * - API routes stay unprefixed: `/api/*`
 * - Public records: `/r/[id]` (en) or `/de/r/[id]` etc.; always noindex
 */
export const routing = defineRouting({
  locales: ["en", "de", "fr", "it", "es", "pl"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
