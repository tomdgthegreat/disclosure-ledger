import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  return (
    <header className="sticky top-0 z-40 border-b border-azure/25 bg-gradient-to-r from-ink via-ink-soft to-[#123058] text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <Link
          href="/"
          className="group flex items-center gap-2 font-semibold tracking-tight text-white"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-azure-bright via-amber to-coral shadow-[0_0_0_3px_rgba(26,108,255,0.45)]"
            aria-hidden
          />
          <span className="transition group-hover:text-azure-soft">
            Disclosure Ledger
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm text-white/75 sm:gap-2">
          <Link
            href="/how-it-works"
            className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white"
          >
            {t("how")}
          </Link>
          <Link
            href="/art-50"
            className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white"
          >
            {t("art50")}
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white"
          >
            {t("pricing")}
          </Link>
          <LanguageSwitcher variant="dark" />
          <Link href="/create" className="btn-coral ml-1 !px-4 !py-1.5">
            {t("create")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
