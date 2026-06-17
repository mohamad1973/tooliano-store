"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { NavMenuItemView } from "@/lib/cms/types";

function isHrefActive(
  pathname: string,
  search: string,
  href: string,
): boolean {
  try {
    const target = new URL(href, "http://local");
    if (target.pathname !== pathname) return false;
    const targetQs = target.searchParams.toString();
    if (!targetQs) return !search || search === "?";
    return `?${targetQs}` === search || target.search === search;
  } catch {
    return pathname === href;
  }
}

function NavInner({ items }: { items: NavMenuItemView[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";

  const linkClass = (active: boolean) =>
    [
      "whitespace-nowrap border-b-2 px-2 py-1 text-[11px] font-semibold transition sm:px-2.5 sm:text-xs",
      active
        ? "border-brand-gold text-brand-navy"
        : "border-transparent text-brand-navy/75 hover:border-brand-gold/60 hover:text-brand-navy",
    ].join(" ");

  if (items.length === 0) {
    return (
      <p className="flex h-9 items-center text-[11px] text-brand-navy/50">
        لا عناصر في القائمة — أضفها من لوحة الأدمن
      </p>
    );
  }

  return (
    <nav
      className="flex max-w-full flex-nowrap items-center justify-center gap-1 sm:gap-2"
      aria-label="قائمة الأقسام"
    >
      {items.map((item) => {
        const external = item.linkType === "external";
        const active = !external && isHrefActive(pathname, search, item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={linkClass(active)}
            prefetch={false}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function HeaderCmsNav({ items }: { items: NavMenuItemView[] }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-8 gap-2">
          {items.slice(0, 6).map((i) => (
            <span
              key={i.id}
              className="h-7 w-14 animate-pulse rounded-full bg-brand-gray"
            />
          ))}
        </div>
      }
    >
      <NavInner items={items} />
    </Suspense>
  );
}
