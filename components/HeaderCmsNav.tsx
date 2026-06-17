"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
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
  const [moreOpen, setMoreOpen] = useState(false);
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

  const visibleItems = items.slice(0, 7);
  const overflowItems = items.slice(7);

  return (
    <nav
      className="flex max-w-full flex-nowrap items-center justify-center gap-1 sm:gap-2"
      aria-label="قائمة الأقسام"
    >
      {visibleItems.map((item) => {
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
      {overflowItems.length > 0 ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-brand-navy transition hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-brand-gold"
            aria-label="عرض باقي القائمة"
            aria-expanded={moreOpen}
          >
            <span className="flex flex-col gap-1" aria-hidden>
              <span className="h-0.5 w-4 rounded-full bg-current" />
              <span className="h-0.5 w-4 rounded-full bg-current" />
              <span className="h-0.5 w-4 rounded-full bg-current" />
            </span>
          </button>
          {moreOpen ? (
            <div className="absolute end-0 top-full z-[120] mt-2 w-52 overflow-hidden rounded-2xl border border-brand-gray bg-brand-white py-2 text-start shadow-xl">
              {overflowItems.map((item) => {
                const external = item.linkType === "external";
                const active =
                  !external && isHrefActive(pathname, search, item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setMoreOpen(false)}
                    className={`block px-4 py-2 text-xs font-semibold transition ${
                      active
                        ? "bg-brand-gold/15 text-brand-navy"
                        : "text-brand-navy/75 hover:bg-brand-gray/40 hover:text-brand-navy"
                    }`}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
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
