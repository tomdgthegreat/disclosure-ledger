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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <HreflangLinks path="/pricing" />
      <p className="text-sm text-slate-500">
        <Link href="/" className="hover:underline">
          {nav("home")}
        </Link>
        {" / "}
        {t("title")}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{t("lead")}</p>
      <div className="mt-6">
        <DisclaimerBanner />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t("freeTitle")}</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {t("freePrice")}
          </p>
          <p className="mt-2 text-sm text-slate-600">{t("freeBody")}</p>
        </div>
        <div className="rounded-xl border-2 border-slate-900 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t("teamTitle")}</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {t("teamPrice")}
            <span className="text-base font-medium text-slate-500">
              {t("teamPeriod")}
            </span>
          </p>
          <p className="mt-2 text-sm text-slate-600">{t("teamBody")}</p>
          <Link
            href="/create"
            className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
      <p className="mt-6 text-sm text-slate-500">{t("note")}</p>
      <p className="mt-8 text-sm text-slate-600">
        <Link href="/how-it-works" className="underline">
          {nav("how")}
        </Link>
        {" · "}
        <Link href="/art-50" className="underline">
          {nav("art50")}
        </Link>
      </p>
    </div>
  );
}
