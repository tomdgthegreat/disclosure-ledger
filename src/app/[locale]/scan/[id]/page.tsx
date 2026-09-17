import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { getScan } from "@/lib/scanStore";
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
    path: `/scan/${params.id}`,
    title: t("scanResultTitle"),
    description: t("scanResultDescription"),
    index: false,
  });
}

function kindLabel(
  kind: string,
  t: Awaited<ReturnType<typeof getTranslations>>
): string {
  if (kind === "no_nearby_disclosure") return t("kindDisclosure");
  if (kind === "no_ledger_link") return t("kindLedger");
  if (kind === "missing_provenance_hints") return t("kindProvenance");
  return kind;
}

export default async function ScanResultPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("scan");
  const nav = await getTranslations("nav");
  const scan = await getScan(params.id);
  if (!scan) notFound();

  return (
    <div className="hero-gradient-light">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-ink-muted">
          <Link href="/scan" className="font-medium text-azure hover:underline">
            {nav("scan")}
          </Link>
          {" / "}
          <span className="font-mono">{scan.id}</span>
        </p>
        <p className="eyebrow mt-3">{t("resultEyebrow")}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">
          {t("resultTitle")}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {t("resultMeta", {
            date: scan.createdAt,
            pages: scan.pagesCrawled,
            images: scan.imagesChecked,
          })}
        </p>
        <p className="mt-1 break-all text-sm text-azure">{scan.targetUrl}</p>

        <div className="mt-6">
          <DisclaimerBanner />
        </div>

        <p className="mt-4 rounded-2xl bg-amber-soft/70 px-4 py-3 text-sm text-ink">
          {t("notAudit")}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-azure/20 bg-white/95 p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {t("statPages")}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-ink">
              {scan.pagesCrawled}
            </p>
          </div>
          <div className="rounded-2xl border border-azure/20 bg-white/95 p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {t("statImages")}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-ink">
              {scan.imagesChecked}
            </p>
          </div>
          <div className="rounded-2xl border border-azure/20 bg-white/95 p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {t("statFindings")}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-ink">
              {scan.findings.length}
            </p>
          </div>
        </div>

        {scan.summary?.truncated && (
          <p className="mt-4 text-sm text-ink-muted">{t("truncatedNote")}</p>
        )}

        <h2 className="mt-10 text-lg font-bold text-ink">{t("findingsTitle")}</h2>
        {scan.findings.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-azure/20 bg-white/95 p-5 text-sm text-ink-muted">
            {t("noFindings")}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {scan.findings.map((f) => (
              <li
                key={f.id}
                className="rounded-2xl border border-coral/25 bg-white/95 p-4 shadow-card"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-coral">
                  {kindLabel(f.kind, t)} · {t("severityReview")}
                </p>
                <p className="mt-2 text-sm text-ink">{f.message}</p>
                {f.pageUrl && (
                  <p className="mt-2 break-all text-xs text-ink-muted">
                    {t("page")}: {f.pageUrl}
                  </p>
                )}
                {f.assetUrl && (
                  <p className="mt-1 break-all text-xs text-ink-muted">
                    {t("asset")}: {f.assetUrl}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 flex flex-wrap gap-2 text-sm">
          <Link href="/scan" className="pill-soft-azure">
            {t("runAnother")}
          </Link>
          <Link href="/create" className="pill-soft-coral">
            {nav("create")}
          </Link>
          <Link href="/pricing" className="pill-soft-azure">
            {nav("pricing")}
          </Link>
        </p>
      </div>
    </div>
  );
}
