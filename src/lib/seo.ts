import type { Metadata } from "next";
import { routing, type AppLocale } from "@/i18n/routing";
import { MARKETING_PATHS } from "@/i18n/pathnames";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://disclosureledger.atlasag.co"
  );
}

/** Locale-aware path: en unprefixed (as-needed), others `/de/...`. */
export function localizedPath(locale: string, path: string): string {
  const normalized = path === "/" ? "/" : path.replace(/\/$/, "") || "/";
  if (locale === routing.defaultLocale) return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function absoluteUrl(locale: string, path: string): string {
  return `${getSiteUrl()}${localizedPath(locale, path)}`;
}

export function buildAlternates(path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = absoluteUrl(locale, path);
  }
  languages["x-default"] = absoluteUrl(routing.defaultLocale, path);
  return {
    canonical: absoluteUrl(routing.defaultLocale, path),
    languages,
  };
}

export function buildPageMetadata(opts: {
  locale: AppLocale | string;
  path: string;
  title: string;
  description: string;
  index?: boolean;
}): Metadata {
  const { locale, path, title, description, index = true } = opts;
  const url = absoluteUrl(locale, path);
  const siteName = "Disclosure Ledger";

  return {
    title,
    description,
    metadataBase: new URL(getSiteUrl()),
    alternates: index
      ? {
          canonical: url,
          languages: Object.fromEntries([
            ...routing.locales.map((l) => [l, absoluteUrl(l, path)]),
            ["x-default", absoluteUrl(routing.defaultLocale, path)],
          ]),
        }
      : { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName,
      locale: locale === "en" ? "en_US" : locale,
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => (l === "en" ? "en_US" : l)),
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

export { MARKETING_PATHS };
