import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { HreflangLinks } from "@/components/HreflangLinks";
import { IconEuro, IconGrow, IconTag } from "@/components/MarketingIcons";
import { buildPageMetadata } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return buildPageMetadata({
    locale: params.locale as AppLocale,
    path: "/pricing",
    title: t("pricingTitle"),
    description: t("pricingDescription"),
  });
}

export default async function PricingPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("pricing");
  const nav = await getTranslations("nav");

  return (
    <div className="hero-gradient-light">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <HreflangLinks path="/pricing" />
        <p className="text-sm text-ink-muted">
          <Link href="/" className="font-medium text-azure hover:underline">
            {nav("home")}
          </Link>
          {" / "}
          {t("title")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {t("title")}
          </h1>
          <span className="pill-coral inline-flex" aria-hidden>
            <IconEuro size={16} />
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-ink-muted">{t("lead")}</p>
        <div className="mt-6">
          <DisclaimerBanner />
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="card-amber relative overflow-hidden p-7">
            <div
              className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full bg-white/50 blur-2xl"
              aria-hidden
            />
            <span className="pill-amber relative mb-3 inline-flex" aria-hidden>
              <IconTag size={16} />
            </span>
            <h2 className="relative font-bold text-ink">{t("freeTitle")}</h2>
            <p className="relative mt-2 text-4xl font-extrabold text-ink">
              {t("freePrice")}
            </p>
            <p className="relative mt-3 text-sm text-ink-muted">{t("freeBody")}</p>
          </div>
          <div className="card-gradient relative overflow-hidden p-7">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-coral/45 blur-2xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-amber/35 blur-2xl"
              aria-hidden
            />
            <span className="pill-coral relative mb-3 inline-flex" aria-hidden>
              <IconGrow size={16} />
            </span>
            <h2 className="relative font-bold text-white">{t("teamTitle")}</h2>
            <p className="relative mt-2 text-4xl font-extrabold text-white">
              {t("teamPrice")}
              <span className="text-base font-medium text-white/70">
                {t("teamPeriod")}
              </span>
            </p>
            <p className="relative mt-3 text-sm text-white/80">{t("teamBody")}</p>
            <Link href="/create" className="btn-coral relative mt-5">
              {t("cta")}
            </Link>
          </div>
        </div>
        <p className="mt-6 rounded-2xl bg-azure-soft/50 px-4 py-3 text-sm text-ink-muted">
          {t("note")}
        </p>
        <p className="mt-8 flex flex-wrap gap-2 text-sm">
          <Link href="/how-it-works" className="pill-soft-azure">
            {nav("how")}
          </Link>
          <Link href="/art-50" className="pill-soft-coral">
            {nav("art50")}
          </Link>
        </p>
      </div>
    </div>
  );
}
