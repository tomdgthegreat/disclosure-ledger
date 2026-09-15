import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Public records are noindex via meta; also discourage crawling /r/
        disallow: ["/r/", "/*/r/", "/ops", "/*/ops", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
