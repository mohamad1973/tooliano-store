"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/operations", label: "طلبات المنتجات" },
  { href: "/admin/operations/hidden", label: "المنتجات المخفية" },
] as const;

export function AdminOperationsProductTabs({
  activeCount,
  hiddenCount,
}: {
  activeCount: number;
  hiddenCount: number;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="mb-4 flex flex-wrap gap-2 border-b border-brand-gray pb-3"
      aria-label="تبويبات المنتجات"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        const count =
          tab.href === "/admin/operations/hidden" ? hiddenCount : activeCount;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              active
                ? "bg-brand-navy text-brand-white"
                : "bg-brand-white text-brand-navy hover:bg-brand-gold/20"
            }`}
          >
            {tab.label}
            <span className="me-2 text-xs font-semibold opacity-80">
              ({count})
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
