import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
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
    <div dir="rtl" className="min-h-screen bg-brand-gray/30">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-brand-gray bg-brand-navy text-brand-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-l">
          <div className="p-4">
            <Link href="/admin" className="block text-lg font-bold text-brand-gold">
              {SITE_NAME}
            </Link>
            <p className="mt-1 text-xs text-brand-white/70">لوحة الإدارة</p>
          </div>
          <nav className="flex flex-wrap gap-1 p-2 lg:flex-col lg:p-4">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm transition hover:bg-brand-white/10 lg:block"
              >
                <span className="font-semibold">{item.label}</span>
                {item.description ? (
                  <span className="mt-0.5 block text-xs text-brand-white/60">
                    {item.description}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap gap-2 border-t border-brand-white/10 p-4">
            <Link
              href="/"
              className="text-xs font-semibold text-brand-gold hover:underline"
            >
              المتجر
            </Link>
            <LogoutButton className="text-xs font-semibold text-brand-white/80 hover:text-brand-white" />
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-brand-navy">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-brand-navy/70">{subtitle}</p>
            ) : null}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
