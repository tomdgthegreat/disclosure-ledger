import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BrandMark } from "./BrandMark";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  return (
    <header className="sticky top-0 z-40 border-b border-azure/20 bg-gradient-to-r from-cream/95 via-azure-soft/70 to-coral-soft/50 text-ink shadow-[0_4px_24px_rgba(26,108,255,0.08)] backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-semibold tracking-tight text-ink"
        >
          <BrandMark
            size={36}
            className="shrink-0 shadow-[0_4px_14px_rgba(255,45,106,0.22)] transition group-hover:scale-[1.04]"
          />
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
