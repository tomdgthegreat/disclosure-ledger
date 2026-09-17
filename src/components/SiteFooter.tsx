import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { IconMark } from "./MarketingIcons";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  return (
    <footer className="mt-auto border-t border-azure/25 bg-gradient-to-br from-azure-soft/90 via-cream to-coral-soft/70 text-ink">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-azure via-azure-bright to-coral text-white shadow-[0_4px_14px_rgba(26,108,255,0.3)]"
            aria-hidden
          >
            <IconMark size={16} />
          </span>
          <p className="font-semibold tracking-tight text-ink">
            Disclosure Ledger
          </p>
        </div>
        <DisclaimerBanner variant="default" />
        <nav className="flex flex-wrap gap-x-2 gap-y-2 text-sm text-ink-muted">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 transition hover:bg-white/70 hover:text-azure-deep"
          >
            {nav("home")}
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full px-3 py-1.5 transition hover:bg-white/70 hover:text-azure-deep"
          >
            {nav("how")}
          </Link>
          <Link
            href="/art-50"
            className="rounded-full px-3 py-1.5 transition hover:bg-white/70 hover:text-azure-deep"
          >
            {nav("art50")}
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-3 py-1.5 transition hover:bg-white/70 hover:text-azure-deep"
          >
            {nav("pricing")}
          </Link>
          <Link
            href="/create"
            className="rounded-full px-3 py-1.5 font-semibold text-coral transition hover:bg-coral-soft hover:text-[#c93a22]"
          >
            {nav("create")}
          </Link>
          <Link
            href="/privacy"
            className="rounded-full px-3 py-1.5 transition hover:bg-white/70 hover:text-azure-deep"
          >
            {nav("privacy")}
          </Link>
          <Link
            href="/terms"
            className="rounded-full px-3 py-1.5 transition hover:bg-white/70 hover:text-azure-deep"
          >
            {nav("terms")}
          </Link>
          <Link
            href="/legal"
            className="rounded-full px-3 py-1.5 transition hover:bg-white/70 hover:text-azure-deep"
          >
            {nav("legal")}
          </Link>
          <Link
            href="/cookies"
            className="rounded-full px-3 py-1.5 transition hover:bg-white/70 hover:text-azure-deep"
          >
            {nav("cookies")}
          </Link>
          <LanguageSwitcher variant="light" />
        </nav>
        <p className="text-xs leading-relaxed text-ink-muted/85">
          {t("tagline")} {t("by")} © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
