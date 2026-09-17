import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { getRecord } from "@/lib/db";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { buildPageMetadata } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return buildPageMetadata({
    locale: params.locale as AppLocale,
    path: `/r/${params.id}`,
    title: t("recordTitle"),
    description: t("recordDescription"),
    index: false,
  });
}

export default async function RecordPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("record");
  const record = await getRecord(params.id);
  if (!record) notFound();

  const declarationLabel =
    record.aiDeclaration === "yes"
      ? t("aiYes")
      : record.aiDeclaration === "partial"
        ? t("aiPartial")
        : t("aiNo");

  return (
    <div className="hero-gradient-light">
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="eyebrow">
        {t("eyebrow")}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-ink">
        {t("title")}{" "}
        <span className="font-mono text-lg">{record.id}</span>
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {t("created", { date: record.createdAt })}
      </p>

      <div className="mt-6">
        <DisclaimerBanner />
      </div>

      <dl className="mt-8 space-y-5 rounded-xl border border-azure/20 bg-white/95 p-6 shadow-card">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {t("hash")}
          </dt>
          <dd className="mt-1 break-all font-mono text-sm text-ink">
            {record.contentHashSha256}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {t("source")}
          </dt>
          <dd className="mt-1 text-sm text-ink">
            {record.fileName} · {record.fileSizeBytes.toLocaleString()} bytes ·{" "}
            {record.mimeType}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {t("ai")}
          </dt>
          <dd className="mt-1 text-sm font-medium text-ink">
            {declarationLabel}
          </dd>
          {record.notes && (
            <dd className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">
              {t("notes", { notes: record.notes })}
            </dd>
          )}
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {t("prov")}
          </dt>
          <dd className="mt-1 text-sm text-ink">
            {record.provenance.found ? t("provFound") : t("provNone")}
          </dd>
          <dd className="mt-1 text-xs text-ink-muted">
            {record.provenance.details}
          </dd>
          {record.provenance.signals.length > 0 && (
            <dd className="mt-2">
              <ul className="list-inside list-disc text-xs text-ink-muted">
                {record.provenance.signals.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </dd>
          )}
          <dd className="mt-2 text-xs italic text-ink-muted">
            {t("method", { method: record.provenance.method })}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`/api/records/${record.id}/csv`}
          className="rounded-md border border-azure/25 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-azure-soft"
        >
          {t("csv")}
        </a>
        <Link
          href="/create"
          className="btn-primary !rounded-md"
        >
          {t("another")}
        </Link>
      </div>

      <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <strong>{t("reminder")}</strong>
      </p>
        </div>
    </div>
  );
}
