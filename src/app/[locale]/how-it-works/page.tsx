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
    { n: "1", title: t("step1Title"), body: t("step1Body"), accent: "text-azure" },
    { n: "2", title: t("step2Title"), body: t("step2Body"), accent: "text-coral" },
    { n: "3", title: t("step3Title"), body: t("step3Body"), accent: "text-amber" },
    { n: "4", title: t("step4Title"), body: t("step4Body"), accent: "text-azure" },
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
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-ink-muted">{t("lead")}</p>
        <div className="mt-6">
          <DisclaimerBanner />
        </div>
        <ol className="mt-10 space-y-6">
          {steps.map((s) => (
            <li key={s.n} className="card-accent p-6 pl-7">
              <p
                className={`text-xs font-bold uppercase tracking-wider ${s.accent}`}
              >
                {t("stepLabel", { step: s.n })}
              </p>
              <h2 className="mt-1 text-lg font-bold text-ink">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
        <Link href="/create" className="btn-coral mt-10">
          {t("cta")}
        </Link>
        <p className="mt-8 text-sm text-ink-muted">
          <Link href="/art-50" className="font-medium text-azure underline">
            {nav("art50")}
          </Link>
          {" · "}
          <Link href="/pricing" className="font-medium text-azure underline">
            {nav("pricing")}
          </Link>
        </p>
      </div>
    </div>
  );
}
