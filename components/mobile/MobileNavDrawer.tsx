"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { NavMenuItemView } from "@/lib/cms/types";
import { WP_STORE_ORIGIN, WP_WISHLIST_URL } from "@/lib/constants";

type Props = {
  items: NavMenuItemView[];
  drawerSide: "start" | "end";
};

function isHrefActive(pathname: string, search: string, href: string): boolean {
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

function DrawerInner({ items, drawerSide }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";

  useEffect(() => {
    setOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const panelSide =
    drawerSide === "end"
      ? "end-0 translate-x-full data-[open=true]:translate-x-0"
      : "start-0 -translate-x-full data-[open=true]:translate-x-0";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-navy transition hover:bg-brand-gold/20 hover:text-brand-gold md:hidden"
        aria-label="فتح القائمة"
        aria-expanded={open}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[100] bg-brand-navy/40 md:hidden"
          aria-label="إغلاق القائمة"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        data-open={open}
        className={`fixed top-0 z-[101] flex h-full w-[min(100vw-3rem,20rem)] flex-col border-brand-gray bg-brand-white shadow-2xl transition-transform duration-300 md:hidden ${panelSide}`}
        aria-hidden={!open}
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-brand-gray px-4 py-3">
          <span className="font-bold text-brand-navy">القائمة</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-brand-gray"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="قائمة الأقسام">
          <ul className="space-y-1">
            {items.map((item) => {
              const external = item.linkType === "external";
              const active =
                !external && isHrefActive(pathname, search, item.href);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-brand-gold text-brand-navy"
                        : "text-brand-navy hover:bg-brand-gray"
                    }`}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-brand-gray p-3">
          <p className="mb-2 text-xs font-semibold text-brand-navy/60">
            روابط سريعة
          </p>
          <div className="flex flex-col gap-1 text-sm">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-brand-gray"
            >
              حسابي
            </Link>
            <Link
              href={`${WP_STORE_ORIGIN}/cart/`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-brand-gray"
            >
              سلة التسوق
            </Link>
            <Link
              href={WP_WISHLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-brand-gray"
            >
              المفضلة
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileNavDrawer(props: Props) {
  return (
    <Suspense
      fallback={
        <span className="h-9 w-9 md:hidden" aria-hidden />
      }
    >
      <DrawerInner {...props} />
    </Suspense>
  );
}
