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
    path: "/terms",
    title: t("termsTitle"),
    description: t("termsDescription"),
  });
}

export default async function TermsPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("terms");
  const nav = await getTranslations("nav");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <HreflangLinks path="/terms" />
      <p className="text-sm text-slate-500">
        <Link href="/" className="hover:underline">
          {nav("home")}
        </Link>
        {" / "}
        {t("title")}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{t("title")}</h1>
      <p className="mt-3 text-slate-600">{t("lead")}</p>
      <div className="mt-6">
        <DisclaimerBanner />
      </div>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">{t("serviceTitle")}</h2>
        <p className="text-sm leading-relaxed text-slate-700">
          {t("serviceBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          {t("noWarrantyTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">
          {t("noWarrantyBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          {t("selfReportedTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">
          {t("selfReportedBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          {t("liabilityTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">
          {t("liabilityBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">{t("pricingTitle")}</h2>
        <p className="text-sm leading-relaxed text-slate-700">
          {t("pricingBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">{t("lawTitle")}</h2>
        <p className="text-sm leading-relaxed text-slate-700">{t("lawBody")}</p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">{t("contactTitle")}</h2>
        <p className="text-sm leading-relaxed text-slate-700">
          {t("contactBody")}
        </p>
      </section>

      <p className="mt-10 text-sm text-slate-600">
        <Link href="/privacy" className="underline">
          {nav("privacy")}
        </Link>
        {" · "}
        <Link href="/legal" className="underline">
          {nav("legal")}
        </Link>
        {" · "}
        <Link href="/cookies" className="underline">
          {nav("cookies")}
        </Link>
      </p>
    </div>
  );
}
