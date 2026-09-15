import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <Link
          href="/"
          className="group flex items-center gap-2 font-semibold tracking-tight text-ink"
        >
          <span
            className="inline-block h-2 w-2 rounded-full bg-gold shadow-[0_0_0_3px_rgba(212,160,23,0.25)]"
            aria-hidden
          />
          <span className="transition group-hover:text-ink-soft">
            Disclosure Ledger
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm text-ink-muted sm:gap-2">
          <Link
            href="/how-it-works"
            className="rounded-full px-3 py-1.5 transition hover:bg-white hover:text-ink"
          >
            {t("how")}
          </Link>
          <Link
            href="/art-50"
            className="rounded-full px-3 py-1.5 transition hover:bg-white hover:text-ink"
          >
            {t("art50")}
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-3 py-1.5 transition hover:bg-white hover:text-ink"
          >
            {t("pricing")}
          </Link>
          <LanguageSwitcher />
          <Link href="/create" className="btn-primary ml-1 !px-4 !py-1.5">
            {t("create")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
