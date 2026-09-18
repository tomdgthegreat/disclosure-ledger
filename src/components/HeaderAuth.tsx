"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";

export function HeaderAuth({
  email,
  loginLabel,
  logoutLabel,
}: {
  email: string | null;
  loginLabel: string;
  logoutLabel: string;
}) {
  const locale = useLocale();

  if (!email) {
    return (
      <Link
        href="/login"
        className="rounded-full px-3 py-1.5 transition hover:bg-azure-soft/80 hover:text-azure-deep"
      >
        {loginLabel}
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-1 sm:gap-2">
      <span
        className="hidden max-w-[10rem] truncate rounded-full bg-white/60 px-2.5 py-1 text-xs text-ink-muted sm:inline"
        title={email}
      >
        {email}
      </span>
      <a
        href={`/api/auth/logout?locale=${encodeURIComponent(locale)}`}
        className="rounded-full px-3 py-1.5 transition hover:bg-azure-soft/80 hover:text-azure-deep"
      >
        {logoutLabel}
      </a>
    </span>
  );
}
