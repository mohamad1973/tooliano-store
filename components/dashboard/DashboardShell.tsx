import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { HeaderNotificationsBell } from "@/components/notifications/HeaderNotificationsBell";
import { SITE_NAME } from "@/lib/constants";

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  homeHref?: string;
};

export function DashboardShell({
  title,
  subtitle,
  children,
  homeHref = "/",
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-brand-white">
      <header className="border-b border-brand-gray bg-brand-navy text-brand-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <Link href={homeHref} className="text-lg font-bold hover:text-brand-gold">
              {SITE_NAME}
            </Link>
            <h1 className="mt-1 text-xl font-bold">{title}</h1>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-brand-white/75">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <HeaderNotificationsBell onDark />
            <Link
              href="/"
              className="text-sm text-brand-white/80 hover:text-brand-gold"
            >
              المتجر
            </Link>
            <LogoutButton className="border-brand-white/30 text-brand-white hover:border-brand-gold hover:text-brand-gold" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
