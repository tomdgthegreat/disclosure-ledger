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
    { step: "1", title: t("step1Title"), body: t("step1Body"), tint: "azure" },
    { step: "2", title: t("step2Title"), body: t("step2Body"), tint: "coral" },
    { step: "3", title: t("step3Title"), body: t("step3Body"), tint: "amber" },
    { step: "4", title: t("step4Title"), body: t("step4Body"), tint: "azure" },
  ];

  const stepAccent: Record<string, string> = {
    azure: "text-azure",
    coral: "text-coral",
    amber: "text-amber",
  };

  return (
    <div>
      <div className="hero-gradient">
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-14 sm:pt-20">
          <HreflangLinks path="/" />
          <JsonLd data={organizationJsonLd(siteUrl)} />
          <JsonLd
            data={softwareApplicationJsonLd(siteUrl, tMeta("homeDescription"))}
          />

          <section className="space-y-6">
            <p className="eyebrow-on-dark">{t("eyebrow")}</p>
            <h1 className="text-balance max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/80">
              {t("lead")}
            </p>
            <div className="max-w-2xl"><DisclaimerBanner variant="inverse" /></div>
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
          </section>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        <section id="problem" className="mt-16 space-y-5">
          <h2 className="section-title">{t("problemTitle")}</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {[
              { item: t("problem1"), bar: "bg-azure" },
              { item: t("problem2"), bar: "bg-coral" },
              { item: t("problem3"), bar: "bg-amber" },
            ].map(({ item, bar }) => (
              <li key={item} className="card-accent p-5 pl-6 text-sm text-ink-muted">
                <span className={`mb-2 inline-block h-1.5 w-10 rounded-full ${bar}`} />
                <p className="leading-relaxed font-medium text-ink">{item}</p>
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
              className="text-sm font-semibold text-azure underline decoration-azure/40 underline-offset-4 hover:decoration-azure"
            >
              {t("howMore")}
            </Link>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <li key={item.step} className="card-surface p-5">
                <span
                  className={`text-xs font-bold uppercase tracking-[0.14em] ${stepAccent[item.tint]}`}
                >
                  {item.step}
                </span>
                <h3 className="mt-2 text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section id="definitions" className="mt-20 space-y-4">
          <h2 className="section-title">{t("definitionsTitle")}</h2>
          <blockquote className="card-surface border-l-4 border-l-azure p-5 text-sm leading-relaxed text-ink">
            {t("defLedger")}
          </blockquote>
          <blockquote className="card-tinted p-5 text-sm leading-relaxed text-ink">
            {t("defArt50")}
          </blockquote>
          <blockquote className="card-coral p-5 text-sm leading-relaxed text-ink">
            {t("defAtlas")}
          </blockquote>
        </section>

        <section id="pricing" className="mt-20 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="section-title">{t("pricingTitle")}</h2>
            <Link
              href="/pricing"
              className="text-sm font-semibold text-azure underline decoration-azure/40 underline-offset-4 hover:decoration-azure"
            >
              {t("pricingMore")}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-surface p-6">
              <h3 className="font-bold text-ink">{tp("freeTitle")}</h3>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-ink">
                {tp("freePrice")}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{tp("freeBody")}</p>
            </div>
            <div className="card-surface border-azure/30 p-6 shadow-glow ring-1 ring-azure/20">
              <h3 className="font-bold text-ink">{tp("teamTitle")}</h3>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-azure">
                {tp("teamPrice")}
                <span className="text-base font-medium text-ink-muted">
                  {tp("teamPeriod")}
                </span>
              </p>
              <p className="mt-2 text-sm text-ink-muted">{tp("teamBody")}</p>
              <Link href="/create" className="btn-primary mt-5 !px-4">
                {tp("cta")}
              </Link>
            </div>
          </div>
        </section>

        <FaqSection />

        <section className="card-coral mt-20 space-y-3 border-coral/30 p-6">
          <h2 className="text-lg font-extrabold text-ink">{t("neverTitle")}</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-ink-muted">
            <li>{t("never1")}</li>
            <li>{t("never2")}</li>
            <li>{t("never3")}</li>
            <li>{t("never4")}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
