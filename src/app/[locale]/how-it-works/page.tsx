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
    path: "/how-it-works",
    title: t("howTitle"),
    description: t("howDescription"),
  });
}

export default async function HowItWorksPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("how");
  const nav = await getTranslations("nav");

  const steps = [
    { n: "1", title: t("step1Title"), body: t("step1Body") },
    { n: "2", title: t("step2Title"), body: t("step2Body") },
    { n: "3", title: t("step3Title"), body: t("step3Body") },
    { n: "4", title: t("step4Title"), body: t("step4Body") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <HreflangLinks path="/how-it-works" />
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
      <ol className="mt-10 space-y-6">
        {steps.map((s) => (
          <li
            key={s.n}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("stepLabel", { step: s.n })}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {s.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {s.body}
            </p>
          </li>
        ))}
      </ol>
      <Link
        href="/create"
        className="mt-10 inline-block rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        {t("cta")}
      </Link>
      <p className="mt-8 text-sm text-slate-600">
        <Link href="/art-50" className="underline">
          {nav("art50")}
        </Link>
        {" · "}
        <Link href="/pricing" className="underline">
          {nav("pricing")}
        </Link>
      </p>
    </div>
  );
}
