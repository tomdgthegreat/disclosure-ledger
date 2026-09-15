import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight text-slate-900">
          Disclosure Ledger
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          <Link href="/#how" className="hover:text-slate-900">
            How it works
          </Link>
          <Link href="/#pricing" className="hover:text-slate-900">
            Pricing
          </Link>
          <Link
            href="/create"
            className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-800"
          >
            Create record
          </Link>
        </nav>
      </div>
    </header>
  );
}
