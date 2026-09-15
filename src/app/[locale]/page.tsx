import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { FaqSection } from "@/components/FaqSection";
import {
  JsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
} from "@/components/JsonLd";
import { HreflangLinks } from "@/components/HreflangLinks";
import { buildPageMetadata, getSiteUrl } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return buildPageMetadata({
    locale: params.locale as AppLocale,
    path: "/",
    title: t("homeTitle"),
    description: t("homeDescription"),
  });
}

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("home");
  const tMeta = await getTranslations("meta");
  const tp = await getTranslations("pricing");
  const siteUrl = getSiteUrl();

  const steps = [
    {
      step: "1",
      title: t("step1Title"),
      body: t("step1Body"),
      panel: "card-tinted",
      badge: "pill-azure",
      emoji: "📤",
    },
    {
      step: "2",
      title: t("step2Title"),
      body: t("step2Body"),
      panel: "card-coral",
      badge: "pill-coral",
      emoji: "🔏",
    },
    {
      step: "3",
      title: t("step3Title"),
      body: t("step3Body"),
      panel: "card-amber",
      badge: "pill-amber",
      emoji: "🧾",
    },
    {
      step: "4",
      title: t("step4Title"),
      body: t("step4Body"),
      panel: "card-tinted",
      badge: "pill-azure",
      emoji: "🔗",
    },
  ];

  const problems = [
    { item: t("problem1"), panel: "card-tinted", chip: "pill-soft-azure", emoji: "🧩" },
    { item: t("problem2"), panel: "card-coral", chip: "pill-soft-coral", emoji: "⏱️" },
    { item: t("problem3"), panel: "card-amber", chip: "pill-amber", emoji: "🛡️" },
  ];

  return (
    <div>
      <div className="hero-gradient relative overflow-hidden">
        <div
          className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-azure-bright/40 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-coral/35 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-14 sm:pt-20">
          <HreflangLinks path="/" />
          <JsonLd data={organizationJsonLd(siteUrl)} />
          <JsonLd
            data={softwareApplicationJsonLd(siteUrl, tMeta("homeDescription"))}
          />

          <section className="space-y-6">
            <p className="eyebrow-on-dark">✨ {t("eyebrow")}</p>
            <h1 className="text-balance max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/85">
              {t("lead")}
            </p>
            <div className="max-w-2xl">
              <DisclaimerBanner variant="inverse" />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/create" className="btn-coral">
                {t("ctaCreate")}
              </Link>
              <Link href="/pricing" className="btn-secondary-on-dark">
                {t("ctaPricing")}
              </Link>
              <Link href="/art-50" className="btn-secondary-on-dark">
                {t("art50Link")}
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 pt-2" aria-hidden>
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm">🇪🇺</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm">⚡</span>
              <span className="rounded-full bg-coral/35 px-3 py-1 text-sm">🎨</span>
            </div>
          </section>
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-16">
        <section id="problem" className="mt-16 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="section-title">{t("problemTitle")}</h2>
            <span className="pill-soft-coral" aria-hidden>💡</span>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {problems.map(({ item, panel, chip, emoji }) => (
              <li key={item} className={`${panel} relative p-6`}>
                <span className={`${chip} mb-3`}>{emoji}</span>
                <p className="leading-relaxed font-semibold text-ink">{item}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-muted">{t("problemNote")}</p>
        </section>

        <section id="how" className="mt-20 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="section-title">{t("howTitle")}</h2>
            <Link
              href="/how-it-works"
              className="pill-soft-azure transition hover:bg-azure hover:text-white"
            >
              {t("howMore")}
            </Link>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, i) => (
              <li
                key={item.step}
                className={`${item.panel} relative p-5 ${i % 2 === 1 ? "lg:translate-y-3" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className={item.badge}>
                    {item.emoji} {item.step}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section id="definitions" className="mt-20 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="section-title">{t("definitionsTitle")}</h2>
            <span className="pill-soft-azure" aria-hidden>📚</span>
          </div>
          <blockquote className="card-tinted p-6 text-sm leading-relaxed text-ink">
            {t("defLedger")}
          </blockquote>
          <blockquote className="card-amber -mt-1 ml-0 p-6 text-sm leading-relaxed text-ink sm:ml-6">
            {t("defArt50")}
          </blockquote>
          <blockquote className="card-coral -mt-1 p-6 text-sm leading-relaxed text-ink sm:mr-6">
            {t("defAtlas")}
          </blockquote>
        </section>

        <section id="pricing" className="mt-20 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="section-title">{t("pricingTitle")}</h2>
            <Link
              href="/pricing"
              className="pill-soft-azure transition hover:bg-azure hover:text-white"
            >
              {t("pricingMore")}
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="card-amber relative overflow-hidden p-7">
              <span className="pill-amber mb-3" aria-hidden>🆓</span>
              <h3 className="font-bold text-ink">{tp("freeTitle")}</h3>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-ink">
                {tp("freePrice")}
              </p>
              <p className="mt-3 text-sm text-ink-muted">{tp("freeBody")}</p>
            </div>
            <div className="card-gradient relative overflow-hidden p-7">
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-coral/40 blur-2xl"
                aria-hidden
              />
              <span className="pill-coral relative mb-3" aria-hidden>🚀</span>
              <h3 className="relative font-bold text-white">{tp("teamTitle")}</h3>
              <p className="relative mt-2 text-4xl font-extrabold tracking-tight text-white">
                {tp("teamPrice")}
                <span className="text-base font-medium text-white/70">
                  {tp("teamPeriod")}
                </span>
              </p>
              <p className="relative mt-3 text-sm text-white/80">{tp("teamBody")}</p>
              <Link href="/create" className="btn-coral relative mt-6 !px-5">
                {tp("cta")}
              </Link>
            </div>
          </div>
        </section>

        <FaqSection />

        <section className="card-coral relative mt-20 overflow-hidden p-7 sm:p-8">
          <div
            className="pointer-events-none absolute -bottom-10 -right-6 h-40 w-40 rounded-full bg-amber/40 blur-2xl"
            aria-hidden
          />
          <div className="relative flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-extrabold text-ink">{t("neverTitle")}</h2>
            <span className="pill-coral" aria-hidden>✋</span>
          </div>
          <ul className="relative mt-4 grid gap-2 sm:grid-cols-2">
            {[t("never1"), t("never2"), t("never3"), t("never4")].map((item) => (
              <li
                key={item}
                className="rounded-2xl bg-white/50 px-4 py-3 text-sm font-medium text-ink"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
