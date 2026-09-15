"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { DisclosureRecord } from "@/lib/types";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export default function OpsPage() {
  const t = useTranslations("ops");
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<DisclosureRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const res = await fetch("/api/ops", {
      headers: { "x-ops-password": password },
    });
    const data = (await res.json()) as {
      records?: DisclosureRecord[];
      error?: string;
    };
    if (!res.ok) {
      setError(data.error ?? "Failed");
      setRecords(null);
      return;
    }
    setRecords(data.records ?? []);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
      <p className="mt-2 text-sm text-slate-600">{t("lead")}</p>
      <div className="mt-4">
        <DisclaimerBanner />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="OPS_PASSWORD"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t("load")}
        </button>
        {password && (
          <a
            href={`/api/ops?format=csv&password=${encodeURIComponent(password)}`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm"
          >
            {t("csv")}
          </a>
        )}
      </div>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {records && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">{t("colId")}</th>
                <th className="px-3 py-2">{t("colCreated")}</th>
                <th className="px-3 py-2">{t("colHash")}</th>
                <th className="px-3 py-2">{t("colAi")}</th>
                <th className="px-3 py-2">{t("colFile")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-mono text-xs">
                    <a className="underline" href={`/r/${r.id}`}>
                      {r.id}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-xs">{r.createdAt}</td>
                  <td className="max-w-[12rem] truncate px-3 py-2 font-mono text-xs">
                    {r.contentHashSha256}
                  </td>
                  <td className="px-3 py-2">{r.aiDeclaration}</td>
                  <td className="px-3 py-2">{r.fileName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <p className="p-4 text-sm text-slate-500">{t("empty")}</p>
          )}
        </div>
      )}
    </div>
  );
}
