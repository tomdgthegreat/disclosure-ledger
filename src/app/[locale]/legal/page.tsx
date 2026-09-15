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
    path: "/legal",
    title: t("legalTitle"),
    description: t("legalDescription"),
  });
}

export default async function LegalPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("legal");
  const nav = await getTranslations("nav");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <HreflangLinks path="/legal" />
      <p className="text-sm text-ink-muted">
        <Link href="/" className="hover:underline">
          {nav("home")}
        </Link>
        {" / "}
        {t("title")}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-ink">{t("title")}</h1>
      <p className="mt-3 text-ink-muted">{t("lead")}</p>
      <div className="mt-6">
        <DisclaimerBanner />
      </div>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">
          {t("operatorTitle")}
        </h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">
          {t("operatorBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">{t("productTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          {t("productBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">
          {t("disclaimerTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          {t("disclaimerBody")}
        </p>
      </section>

      <p className="mt-10 text-sm text-ink-muted">
        <Link href="/privacy" className="underline">
          {nav("privacy")}
        </Link>
        {" · "}
        <Link href="/terms" className="underline">
          {nav("terms")}
        </Link>
        {" · "}
        <Link href="/cookies" className="underline">
          {nav("cookies")}
        </Link>
      </p>
    </div>
  );
}
