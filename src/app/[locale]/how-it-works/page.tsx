import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { HreflangLinks } from "@/components/HreflangLinks";
import {
  IconCompass,
  IconLink,
  IconReceipt,
  IconSeal,
  IconUpload,
} from "@/components/MarketingIcons";
import { buildPageMetadata } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";
import type { ReactNode } from "react";

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

  const steps: {
    n: string;
    title: string;
    body: string;
    panel: string;
    badge: string;
    icon: ReactNode;
  }[] = [
    {
      n: "1",
      title: t("step1Title"),
      body: t("step1Body"),
      panel: "card-tinted",
      badge: "pill-azure",
      icon: <IconUpload size={14} />,
    },
    {
      n: "2",
      title: t("step2Title"),
      body: t("step2Body"),
      panel: "card-coral",
      badge: "pill-coral",
      icon: <IconSeal size={14} />,
    },
    {
      n: "3",
      title: t("step3Title"),
      body: t("step3Body"),
      panel: "card-amber",
      badge: "pill-amber",
      icon: <IconReceipt size={14} />,
    },
    {
      n: "4",
      title: t("step4Title"),
      body: t("step4Body"),
      panel: "card-tinted",
      badge: "pill-azure",
      icon: <IconLink size={14} />,
    },
  ];

  return (
    <div className="hero-gradient-light">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <HreflangLinks path="/how-it-works" />
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
          <span className="pill-soft-azure inline-flex" aria-hidden>
            <IconCompass size={16} />
          </span>
        </div>
        <p className="mt-3 text-ink-muted">{t("lead")}</p>
        <div className="mt-6">
          <DisclaimerBanner />
        </div>
        <ol className="mt-10 space-y-5">
          {steps.map((s) => (
            <li key={s.n} className={`${s.panel} p-6`}>
              <span className={`${s.badge} inline-flex items-center gap-1.5`}>
                {s.icon}
                {t("stepLabel", { step: s.n })}
              </span>
              <h2 className="mt-3 text-lg font-bold text-ink">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
        <Link href="/create" className="btn-coral mt-10">
          {t("cta")}
        </Link>
        <p className="mt-8 flex flex-wrap gap-2 text-sm">
          <Link href="/art-50" className="pill-soft-azure">
            {nav("art50")}
          </Link>
          <Link href="/pricing" className="pill-soft-coral">
            {nav("pricing")}
          </Link>
        </p>
      </div>
    </div>
  );
}
