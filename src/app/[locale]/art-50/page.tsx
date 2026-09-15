import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { FaqSection } from "@/components/FaqSection";
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
    path: "/art-50",
    title: t("art50Title"),
    description: t("art50Description"),
  });
}

export default async function Art50Page({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("art50");
  const nav = await getTranslations("nav");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <HreflangLinks path="/art-50" />
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
        <h2 className="text-xl font-bold text-slate-900">{t("whatTitle")}</h2>
        <p className="text-sm leading-relaxed text-slate-700">{t("whatBody")}</p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          {t("whatWeAreTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">{t("whatWeAre")}</p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          {t("whatWeAreNotTitle")}
        </h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
          <li>{t("not1")}</li>
          <li>{t("not2")}</li>
          <li>{t("not3")}</li>
          <li>{t("not4")}</li>
        </ul>
      </section>

      <blockquote className="mt-10 rounded-xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-800 shadow-sm">
        {t("geoDef")}
      </blockquote>

      <FaqSection />

      <p className="mt-10 text-sm text-slate-600">
        <Link href="/how-it-works" className="underline">
          {nav("how")}
        </Link>
        {" · "}
        <Link href="/pricing" className="underline">
          {nav("pricing")}
        </Link>
        {" · "}
        <Link href="/create" className="underline">
          {nav("create")}
        </Link>
      </p>
    </div>
  );
}
