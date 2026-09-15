import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";

/** Explicit hreflang link tags (complements metadata.alternates). */
export function HreflangLinks({ path }: { path: string }) {
  return (
    <>
      {routing.locales.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={absoluteUrl(locale, path)}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={absoluteUrl(routing.defaultLocale, path)}
      />
    </>
  );
}
