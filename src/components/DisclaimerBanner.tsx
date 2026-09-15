export function DisclaimerBanner({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`rounded-lg border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 ${className}`}
      role="note"
    >
      <p className="font-semibold">Self-reported &amp; unverified</p>
      <p className="mt-1 leading-relaxed">
        Declarations on Disclosure Ledger are submitted by the publisher. This
        service does <strong>not</strong> verify authenticity, does{" "}
        <strong>not</strong> cryptographically attest images, does{" "}
        <strong>not</strong> provide legal compliance opinions, and does{" "}
        <strong>not</strong> claim EU AI Act Art. 50 adequacy. It is a
        declaration / audit-trail tool only.
      </p>
    </aside>
  );
}
