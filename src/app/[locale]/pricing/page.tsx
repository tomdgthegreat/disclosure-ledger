import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { HreflangLinks } from "@/components/HreflangLinks";
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
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-ink-muted">{t("lead")}</p>
        <div className="mt-6">
          <DisclaimerBanner />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="card-surface p-6">
            <h2 className="font-bold text-ink">{t("freeTitle")}</h2>
            <p className="mt-2 text-3xl font-extrabold text-ink">
              {t("freePrice")}
            </p>
            <p className="mt-2 text-sm text-ink-muted">{t("freeBody")}</p>
          </div>
          <div className="card-surface border-azure/30 p-6 shadow-glow ring-1 ring-azure/20">
            <h2 className="font-bold text-ink">{t("teamTitle")}</h2>
            <p className="mt-2 text-3xl font-extrabold text-azure">
              {t("teamPrice")}
              <span className="text-base font-medium text-ink-muted">
                {t("teamPeriod")}
              </span>
            </p>
            <p className="mt-2 text-sm text-ink-muted">{t("teamBody")}</p>
            <Link href="/create" className="btn-coral mt-4">
              {t("cta")}
            </Link>
          </div>
        </div>
        <p className="mt-6 text-sm text-ink-muted">{t("note")}</p>
        <p className="mt-8 text-sm text-ink-muted">
          <Link href="/how-it-works" className="font-medium text-azure underline">
            {nav("how")}
          </Link>
          {" · "}
          <Link href="/art-50" className="font-medium text-azure underline">
            {nav("art50")}
          </Link>
        </p>
      </div>
    </div>
  );
}
