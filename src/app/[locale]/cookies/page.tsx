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
    path: "/cookies",
    title: t("cookiesTitle"),
    description: t("cookiesDescription"),
  });
}

export default async function CookiesPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("cookies");
  const nav = await getTranslations("nav");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <HreflangLinks path="/cookies" />
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
          {t("essentialTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          {t("essentialBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">
          {t("marketingTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          {t("marketingBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">{t("bannerTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-muted">{t("bannerBody")}</p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">{t("contactTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          {t("contactBody")}
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
        <Link href="/legal" className="underline">
          {nav("legal")}
        </Link>
      </p>
    </div>
  );
}
