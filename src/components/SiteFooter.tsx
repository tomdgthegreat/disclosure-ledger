import { DisclaimerBanner } from "./DisclaimerBanner";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
        <DisclaimerBanner />
        <p className="text-xs text-slate-500">
          Disclosure Ledger — declaration / audit trail for publish-bound images.
          Not a compliance product. Not legal advice. © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
