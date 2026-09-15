import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight text-slate-900">
          Disclosure Ledger
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-600 sm:gap-4">
          <Link href="/how-it-works" className="hover:text-slate-900">
            {t("how")}
          </Link>
          <Link href="/art-50" className="hover:text-slate-900">
            {t("art50")}
          </Link>
          <Link href="/pricing" className="hover:text-slate-900">
            {t("pricing")}
          </Link>
          <LanguageSwitcher />
          <Link
            href="/create"
            className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-800"
          >
            {t("create")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
