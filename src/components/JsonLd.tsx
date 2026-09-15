export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Atlas AG",
    url: siteUrl,
    brand: {
      "@type": "Brand",
      name: "Disclosure Ledger",
    },
  };
}

export function softwareApplicationJsonLd(siteUrl: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Disclosure Ledger",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description,
    creator: {
      "@type": "Organization",
      name: "Atlas AG",
    },
    offers: {
      "@type": "Offer",
      price: "29",
      priceCurrency: "USD",
      description:
        "Team plan after 3 free records. Declaration / audit-trail tool only — not compliance certification.",
    },
  };
}

export function faqPageJsonLd(
  items: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
