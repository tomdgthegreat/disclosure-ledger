import { getTranslations } from "next-intl/server";
import { JsonLd, faqPageJsonLd } from "./JsonLd";
import { IconChat } from "./MarketingIcons";

export async function FaqSection() {
  const t = await getTranslations("faq");
  const items = [1, 2, 3, 4, 5].map((n) => ({
    question: t(`q${n}` as "q1"),
    answer: t(`a${n}` as "a1"),
  }));

  const panels = [
    "card-tinted",
    "card-coral",
    "card-amber",
    "card-tinted",
    "card-coral",
  ];

  return (
    <section id="faq" className="mt-20 space-y-6">
      <JsonLd data={faqPageJsonLd(items)} />
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="section-title">{t("title")}</h2>
        <span className="pill-soft-azure inline-flex" aria-hidden>
          <IconChat size={16} />
        </span>
      </div>
      <dl className="grid gap-4">
        {items.map((item, i) => (
          <div key={item.question} className={`${panels[i]} p-6`}>
            <dt className="font-bold text-ink">{item.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
