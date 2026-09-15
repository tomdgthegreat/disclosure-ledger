import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  return (
    <footer className="mt-auto border-t border-azure/30 bg-gradient-to-b from-ink-soft to-ink text-cream">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <DisclaimerBanner variant="inverse" />
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/80">
          <Link href="/" className="transition hover:text-azure-bright">
            {nav("home")}
          </Link>
          <Link href="/how-it-works" className="transition hover:text-azure-bright">
            {nav("how")}
          </Link>
          <Link href="/art-50" className="transition hover:text-azure-bright">
            {nav("art50")}
          </Link>
          <Link href="/pricing" className="transition hover:text-azure-bright">
            {nav("pricing")}
          </Link>
          <Link href="/create" className="transition hover:text-coral-bright">
            {nav("create")}
          </Link>
          <Link href="/privacy" className="transition hover:text-azure-bright">
            {nav("privacy")}
          </Link>
          <Link href="/terms" className="transition hover:text-azure-bright">
            {nav("terms")}
          </Link>
          <Link href="/legal" className="transition hover:text-azure-bright">
            {nav("legal")}
          </Link>
          <Link href="/cookies" className="transition hover:text-azure-bright">
            {nav("cookies")}
          </Link>
          <LanguageSwitcher variant="dark" />
        </nav>
        <p className="text-xs text-cream/55">
          {t("tagline")} {t("by")} © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
