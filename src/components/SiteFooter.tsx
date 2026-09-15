import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  return (
    <footer className="mt-auto border-t border-border bg-ink text-cream">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <DisclaimerBanner variant="inverse" />
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/75">
          <Link href="/" className="hover:text-gold-bright">
            {nav("home")}
          </Link>
          <Link href="/how-it-works" className="hover:text-gold-bright">
            {nav("how")}
          </Link>
          <Link href="/art-50" className="hover:text-gold-bright">
            {nav("art50")}
          </Link>
          <Link href="/pricing" className="hover:text-gold-bright">
            {nav("pricing")}
          </Link>
          <Link href="/create" className="hover:text-gold-bright">
            {nav("create")}
          </Link>
          <Link href="/privacy" className="hover:text-gold-bright">
            {nav("privacy")}
          </Link>
          <Link href="/terms" className="hover:text-gold-bright">
            {nav("terms")}
          </Link>
          <Link href="/legal" className="hover:text-gold-bright">
            {nav("legal")}
          </Link>
          <Link href="/cookies" className="hover:text-gold-bright">
            {nav("cookies")}
          </Link>
          <LanguageSwitcher />
        </nav>
        <p className="text-xs text-cream/55">
          {t("tagline")} {t("by")} © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
