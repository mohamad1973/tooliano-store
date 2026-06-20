import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { HeaderNotificationsBell } from "@/components/notifications/HeaderNotificationsBell";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { SITE_NAME } from "@/lib/constants";

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div dir="ltr" className="min-h-screen bg-[#f0f0f1] text-[#1d2327]">
      <div className="flex min-h-screen">
        <aside className="hidden w-40 shrink-0 bg-[#1d2327] text-[#f0f0f1] md:block">
          <div className="border-b border-white/10 px-3 py-4">
            <Link href="/admin" className="block text-sm font-semibold text-white">
              {SITE_NAME} Admin
            </Link>
            <p className="mt-1 text-[11px] text-[#a7aaad]">WordPress-style dashboard</p>
          </div>
          <nav className="py-2">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block border-l-4 border-transparent px-3 py-2 text-[13px] text-[#c3c4c7] transition hover:border-[#72aee6] hover:bg-[#2c3338] hover:text-white"
              >
                <span className="font-medium">{item.label}</span>
                {item.description ? (
                  <span className="mt-0.5 block text-[11px] text-[#8c8f94]">
                    {item.description}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex min-h-8 items-center justify-between bg-[#1d2327] px-3 text-[13px] text-[#c3c4c7]">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="font-semibold text-white">
                {SITE_NAME}
              </Link>
              <Link href="/" className="hover:text-white">
                View Site
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <HeaderNotificationsBell onDark />
              <LogoutButton className="text-[13px] text-[#c3c4c7] hover:text-white" />
            </div>
          </div>

          <div className="border-b border-[#c3c4c7] bg-white md:hidden">
            <nav className="flex gap-1 overflow-x-auto px-2 py-2">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-sm px-3 py-1.5 text-xs font-medium text-[#1d2327] hover:bg-[#f0f0f1]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <main className="mx-auto max-w-[1200px] p-4 sm:p-6">
            <header className="mb-5">
              <h1 className="text-[23px] font-normal leading-tight text-[#1d2327]">
                {title}
              </h1>
            {subtitle ? (
                <p className="mt-1 text-sm text-[#50575e]">{subtitle}</p>
            ) : null}
            </header>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
