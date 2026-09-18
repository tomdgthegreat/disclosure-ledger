import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/LoginForm";
import { HreflangLinks } from "@/components/HreflangLinks";
import { buildPageMetadata } from "@/lib/seo";
import { getSessionEmail, truncateEmail } from "@/lib/auth";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return buildPageMetadata({
    locale: params.locale as AppLocale,
    path: "/login",
    title: t("loginTitle"),
    description: t("loginDescription"),
  });
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { email?: string; verified?: string; error?: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("login");
  const sessionEmail = getSessionEmail();
  const verified = searchParams?.verified === "1";
  const errorCode = searchParams?.error ?? null;
  const prefill = searchParams?.email ?? sessionEmail ?? "";

  return (
    <div className="hero-gradient-light">
      <div className="mx-auto max-w-lg px-4 py-12">
        <HreflangLinks path="/login" />
        <p className="eyebrow">Disclosure Ledger</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t("lead")}</p>

        {sessionEmail && verified && (
          <p className="mt-4 rounded-2xl bg-azure-soft/70 px-4 py-3 text-sm text-ink">
            {t("signedInAs", { email: truncateEmail(sessionEmail) })}{" "}
            <Link href="/create" className="font-semibold underline">
              {t("continueCreate")}
            </Link>
          </p>
        )}

        <div className="mt-8">
          <LoginForm
            initialEmail={prefill}
            verified={verified}
            errorCode={errorCode}
          />
        </div>
      </div>
    </div>
  );
}
