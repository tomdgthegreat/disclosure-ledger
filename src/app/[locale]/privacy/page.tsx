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
    path: "/privacy",
    title: t("privacyTitle"),
    description: t("privacyDescription"),
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("privacy");
  const nav = await getTranslations("nav");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <HreflangLinks path="/privacy" />
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
          {t("controllerTitle")}
        </h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">
          {t("controllerBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">{t("purposesTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          {t("purposesBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">{t("basesTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-muted">{t("basesBody")}</p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">{t("dataTitle")}</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-ink-muted">
          <li>{t("data1")}</li>
          <li>{t("data2")}</li>
          <li>{t("data3")}</li>
          <li>{t("data4")}</li>
        </ul>
        <p className="text-sm leading-relaxed text-ink-muted">{t("dataNote")}</p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">
          {t("retentionTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          {t("retentionBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">
          {t("processorsTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          {t("processorsBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">
          {t("transfersTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          {t("transfersBody")}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">{t("rightsTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-muted">{t("rightsBody")}</p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">{t("publicTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-muted">{t("publicBody")}</p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-ink">{t("claimsTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-muted">{t("claimsBody")}</p>
      </section>

      <p className="mt-10 text-sm text-ink-muted">
        <Link href="/terms" className="underline">
          {nav("terms")}
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
