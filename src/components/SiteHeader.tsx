import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { IconMark } from "./MarketingIcons";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  return (
    <header className="sticky top-0 z-40 border-b border-azure/20 bg-gradient-to-r from-cream/95 via-azure-soft/70 to-coral-soft/50 text-ink shadow-[0_4px_24px_rgba(26,108,255,0.08)] backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-semibold tracking-tight text-ink"
        >
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-azure via-azure-bright to-coral text-white shadow-[0_4px_14px_rgba(26,108,255,0.35)]"
            aria-hidden
          >
            <IconMark size={16} />
          </span>
          <span className="transition group-hover:text-azure-deep">
            Disclosure Ledger
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm text-ink-muted sm:gap-2">
          <Link
            href="/how-it-works"
            className="rounded-full px-3 py-1.5 transition hover:bg-azure-soft/80 hover:text-azure-deep"
          >
            {t("how")}
          </Link>
          <Link
            href="/art-50"
            className="rounded-full px-3 py-1.5 transition hover:bg-azure-soft/80 hover:text-azure-deep"
          >
            {t("art50")}
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-3 py-1.5 transition hover:bg-azure-soft/80 hover:text-azure-deep"
          >
            {t("pricing")}
          </Link>
          <LanguageSwitcher variant="light" />
          <Link href="/create" className="btn-coral ml-1 !px-4 !py-1.5">
            {t("create")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
