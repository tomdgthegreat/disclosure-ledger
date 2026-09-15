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
    <div className="hero-gradient-light">
      <div className="mx-auto max-w-3xl px-4 py-12">
      <HreflangLinks path="/art-50" />
      <p className="text-sm text-ink-muted">
        <Link href="/" className="font-medium text-azure hover:underline">
          {nav("home")}
        </Link>
        {" / "}
        {t("title")}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">{t("title")}</h1>
      <p className="mt-3 text-ink-muted">{t("lead")}</p>
      <div className="mt-6">
        <DisclaimerBanner />
      </div>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">{t("whatTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-muted">{t("whatBody")}</p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">
          {t("whatWeAreTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-ink-muted">{t("whatWeAre")}</p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">
          {t("whatWeAreNotTitle")}
        </h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-ink-muted">
          <li>{t("not1")}</li>
          <li>{t("not2")}</li>
          <li>{t("not3")}</li>
          <li>{t("not4")}</li>
        </ul>
      </section>

      <blockquote className="card-tinted mt-10 p-5 text-sm leading-relaxed text-ink">
        {t("geoDef")}
      </blockquote>

      <FaqSection />

      <p className="mt-10 text-sm text-ink-muted">
        <Link href="/how-it-works" className="font-medium text-azure underline">
          {nav("how")}
        </Link>
        {" · "}
        <Link href="/pricing" className="font-medium text-azure underline">
          {nav("pricing")}
        </Link>
        {" · "}
        <Link href="/create" className="font-medium text-azure underline">
          {nav("create")}
        </Link>
      </p>
      </div>
    </div>
  );
}

