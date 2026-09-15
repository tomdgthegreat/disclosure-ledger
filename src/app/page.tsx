import Link from "next/link";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="space-y-6">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
          For agencies &amp; brands publishing images
        </p>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          A durable declaration trail when provenance gets stripped
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
          EU AI Act Art. 50 transparency obligations for AI-generated or
          manipulated content begin applying{" "}
          <strong className="font-semibold text-slate-800">
            2 August 2026
          </strong>
          . Publishing pipelines often strip embedded provenance (C2PA /
          Content Credentials). Disclosure Ledger lets you drop a
          publish-bound image, hash it in-browser, self-report an AI
          declaration, and keep a permanent public record page — plus CSV
          export.
        </p>
        <DisclaimerBanner />
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/create"
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Create a free record
          </Link>
          <a
            href="#pricing"
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            See pricing
          </a>
        </div>
      </section>

      <section id="problem" className="mt-20 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">The honest problem</h2>
        <ul className="list-inside list-disc space-y-2 text-slate-700">
          <li>
            Art. 50 raises the bar for transparency around AI-involved imagery —
            buyers need an audit trail they can point to, not a one-off email.
          </li>
          <li>
            CMS uploads, CDNs, and social crops routinely discard embedded
            provenance metadata. Relying only on “the file still has C2PA” is
            fragile.
          </li>
          <li>
            Teams still need a lightweight place to say: here is the hash of what
            we intended to publish, and here is our self-reported declaration.
          </li>
        </ul>
        <p className="text-sm text-slate-500">
          This product does not interpret the law for you and does not claim
          your declarations satisfy Art. 50. Talk to counsel for legal adequacy.
        </p>
      </section>

      <section id="how" className="mt-20 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "1",
              title: "Drop image",
              body: "Client-side only for hashing — image bytes are not uploaded in this MVP.",
            },
            {
              step: "2",
              title: "Hash + scan",
              body: "Browser computes SHA-256 and runs a best-effort provenance marker scan (not validation).",
            },
            {
              step: "3",
              title: "Declare",
              body: "Self-report yes / no / partial AI involvement and optional notes.",
            },
            {
              step: "4",
              title: "Public record",
              body: "Permanent /r/[id] page + CSV export. Always labeled unverified.",
            },
          ].map((item) => (
            <li
              key={item.step}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step {item.step}
              </span>
              <h3 className="mt-1 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="pricing" className="mt-20 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Pricing</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Free trial</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              3 records
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Enough to try the flow end-to-end. No card required for the first
              three local/server records.
            </p>
          </div>
          <div className="rounded-xl border-2 border-slate-900 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Team</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              ~$29<span className="text-base font-medium text-slate-500">/mo</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">
              After free tier. Stripe Checkout (env-based; stubbed until keys
              are configured). Built for agencies and brands shipping images
              regularly.
            </p>
            <Link
              href="/create"
              className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start with 3 free
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-20 space-y-3 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">What we never claim</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
          <li>No claim of legal compliance, signing, or verification.</li>
          <li>No claim that records prove authenticity or authorship.</li>
          <li>
            No claim that the provenance scan is a full C2PA implementation.
          </li>
          <li>
            Every public record page states declarations are self-reported and
            unverified.
          </li>
        </ul>
      </section>
    </div>
  );
}
