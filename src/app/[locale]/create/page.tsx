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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <HreflangLinks path="/create" />
      <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
      <p className="mt-2 text-sm text-slate-600">{t("lead")}</p>
      <div className="mt-8">
        <CreateRecordForm />
      </div>
    </div>
  );
}
