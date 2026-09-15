import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { MARKETING_PATHS, absoluteUrl } from "@/lib/seo";

/** Marketing pages only — public records intentionally excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of MARKETING_PATHS) {
    for (const locale of routing.locales) {
      entries.push({
        url: absoluteUrl(locale, path),
        lastModified: new Date(),
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, absoluteUrl(l, path)])
          ),
        },
      });
    }
  }

  return entries;
}
