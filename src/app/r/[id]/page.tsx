import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecord } from "@/lib/db";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export const dynamic = "force-dynamic";

export default async function RecordPage({
  params,
}: {
  params: { id: string };
}) {
  const record = await getRecord(params.id);
  if (!record) notFound();

  const declarationLabel =
    record.aiDeclaration === "yes"
      ? "AI-generated / AI-altered (self-reported)"
      : record.aiDeclaration === "partial"
        ? "Partial / mixed AI involvement (self-reported)"
        : "No AI involvement (self-reported)";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        Public disclosure record
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">
        Record <span className="font-mono text-lg">{record.id}</span>
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Created {record.createdAt} (UTC)
      </p>

      <div className="mt-6">
        <DisclaimerBanner />
      </div>

      <dl className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Content hash (SHA-256)
          </dt>
          <dd className="mt-1 break-all font-mono text-sm text-slate-900">
            {record.contentHashSha256}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Source file (as declared)
          </dt>
          <dd className="mt-1 text-sm text-slate-800">
            {record.fileName} · {record.fileSizeBytes.toLocaleString()} bytes ·{" "}
            {record.mimeType}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            AI declaration
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">
            {declarationLabel}
          </dd>
          {record.notes && (
            <dd className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              Notes: {record.notes}
            </dd>
          )}
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Provenance summary
          </dt>
          <dd className="mt-1 text-sm text-slate-800">
            {record.provenance.found
              ? "Possible markers reported (unverified)"
              : "No clear markers found by best-effort scan"}
          </dd>
          <dd className="mt-1 text-xs text-slate-500">
            {record.provenance.details}
          </dd>
          {record.provenance.signals.length > 0 && (
            <dd className="mt-2">
              <ul className="list-inside list-disc text-xs text-slate-600">
                {record.provenance.signals.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </dd>
          )}
          <dd className="mt-2 text-xs italic text-slate-500">
            Method: {record.provenance.method}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`/api/records/${record.id}/csv`}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Download CSV
        </a>
        <Link
          href="/create"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create another
        </Link>
      </div>

      <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <strong>Reminder:</strong> This declaration is self-reported and
        unverified. Disclosure Ledger does not attest, sign, or certify this
        image. Not legal advice; not a compliance determination.
      </p>
    </div>
  );
}
