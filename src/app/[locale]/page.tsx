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
    { step: "1", title: t("step1Title"), body: t("step1Body") },
    { step: "2", title: t("step2Title"), body: t("step2Body") },
    { step: "3", title: t("step3Title"), body: t("step3Body") },
    { step: "4", title: t("step4Title"), body: t("step4Body") },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <HreflangLinks path="/" />
      <JsonLd data={organizationJsonLd(siteUrl)} />
      <JsonLd
        data={softwareApplicationJsonLd(siteUrl, tMeta("homeDescription"))}
      />

      <section className="space-y-6">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
          {t("eyebrow")}
        </p>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
          {t("lead")}
        </p>
        <DisclaimerBanner />
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/create"
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {t("ctaCreate")}
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            {t("ctaPricing")}
          </Link>
          <Link
            href="/art-50"
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            {t("art50Link")}
          </Link>
        </div>
      </section>

      <section id="problem" className="mt-20 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">{t("problemTitle")}</h2>
        <ul className="list-inside list-disc space-y-2 text-slate-700">
          <li>{t("problem1")}</li>
          <li>{t("problem2")}</li>
          <li>{t("problem3")}</li>
        </ul>
        <p className="text-sm text-slate-500">{t("problemNote")}</p>
      </section>

      <section id="how" className="mt-20 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-900">{t("howTitle")}</h2>
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-slate-700 underline hover:text-slate-900"
          >
            {t("howMore")}
          </Link>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <li
              key={item.step}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {item.step}
              </span>
              <h3 className="mt-1 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="definitions" className="mt-20 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">
          {t("definitionsTitle")}
        </h2>
        <blockquote className="rounded-xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-800 shadow-sm">
          {t("defLedger")}
        </blockquote>
        <blockquote className="rounded-xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-800 shadow-sm">
          {t("defArt50")}
        </blockquote>
        <blockquote className="rounded-xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-800 shadow-sm">
          {t("defAtlas")}
        </blockquote>
      </section>

      <section id="pricing" className="mt-20 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-900">
            {t("pricingTitle")}
          </h2>
          <Link
            href="/pricing"
            className="text-sm font-medium text-slate-700 underline hover:text-slate-900"
          >
            {t("pricingMore")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">{tp("freeTitle")}</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {tp("freePrice")}
            </p>
            <p className="mt-2 text-sm text-slate-600">{tp("freeBody")}</p>
          </div>
          <div className="rounded-xl border-2 border-slate-900 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">{tp("teamTitle")}</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {tp("teamPrice")}
              <span className="text-base font-medium text-slate-500">
                {tp("teamPeriod")}
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-600">{tp("teamBody")}</p>
            <Link
              href="/create"
              className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {tp("cta")}
            </Link>
          </div>
        </div>
      </section>

      <FaqSection />

      <section className="mt-20 space-y-3 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">{t("neverTitle")}</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
          <li>{t("never1")}</li>
          <li>{t("never2")}</li>
          <li>{t("never3")}</li>
          <li>{t("never4")}</li>
        </ul>
      </section>
    </div>
  );
}
