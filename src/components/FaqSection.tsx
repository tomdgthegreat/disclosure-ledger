import { getTranslations } from "next-intl/server";
import { JsonLd, faqPageJsonLd } from "./JsonLd";

export async function FaqSection() {
  const t = await getTranslations("faq");
  const items = [1, 2, 3, 4, 5].map((n) => ({
    question: t(`q${n}` as "q1"),
    answer: t(`a${n}` as "a1"),
  }));

  return (
    <section id="faq" className="mt-20 space-y-6">
      <JsonLd data={faqPageJsonLd(items)} />
      <h2 className="section-title">{t("title")}</h2>
      <dl className="space-y-4">
        {items.map((item) => (
          <div
            key={item.question}
            className="card-surface p-5"
          >
            <dt className="font-semibold text-ink">{item.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
