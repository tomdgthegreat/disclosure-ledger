import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
        <DisclaimerBanner />
        <nav className="flex flex-wrap gap-4 text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-900">
            {nav("home")}
          </Link>
          <Link href="/how-it-works" className="hover:text-slate-900">
            {nav("how")}
          </Link>
          <Link href="/art-50" className="hover:text-slate-900">
            {nav("art50")}
          </Link>
          <Link href="/pricing" className="hover:text-slate-900">
            {nav("pricing")}
          </Link>
          <Link href="/create" className="hover:text-slate-900">
            {nav("create")}
          </Link>
          <LanguageSwitcher />
        </nav>
        <p className="text-xs text-slate-500">
          {t("tagline")} {t("by")} © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
