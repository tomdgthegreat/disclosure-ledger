import { getTranslations, setRequestLocale } from "next-intl/server";
import { CreateRecordForm } from "@/components/CreateRecordForm";
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
    path: "/create",
    title: t("createTitle"),
    description: t("createDescription"),
  });
}

export default async function CreatePage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("create");

  return (
    <div className="hero-gradient-light">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <HreflangLinks path="/create" />
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow">Disclosure Ledger</p>
          <span className="pill-soft-coral" aria-hidden>✨</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t("lead")}</p>
        <div className="mt-8">
          <CreateRecordForm />
        </div>
      </div>
    </div>
  );
}
