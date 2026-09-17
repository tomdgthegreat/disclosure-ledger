import { getTranslations, setRequestLocale } from "next-intl/server";
import { HreflangLinks } from "@/components/HreflangLinks";
import { ScanForm } from "@/components/ScanForm";
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
    path: "/scan",
    title: t("scanTitle"),
    description: t("scanDescription"),
  });
}

export default async function ScanPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("scan");

  return (
    <div className="hero-gradient-light">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <HreflangLinks path="/scan" />
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t("lead")}</p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-muted">
          <li>{t("bullet1")}</li>
          <li>{t("bullet2")}</li>
          <li>{t("bullet3")}</li>
        </ul>
        <p className="mt-4 rounded-2xl bg-azure-soft/50 px-4 py-3 text-sm text-ink-muted">
          {t("notAudit")}
        </p>
        <div className="mt-8">
          <ScanForm />
        </div>
      </div>
    </div>
  );
}
