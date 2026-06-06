"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { NavMenuItemView } from "@/lib/cms/types";
import { WP_STORE_ORIGIN, WP_WISHLIST_URL } from "@/lib/constants";

type Props = {
  items: NavMenuItemView[];
  drawerSide: "start" | "end";
  siteName?: string;
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

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
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
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    );
  }
  return (
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
  );
}

function DrawerInner({ items, drawerSide, siteName }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const fromRight = drawerSide === "start";
  const panelPosition = fromRight ? "right-0" : "left-0";
  const panelClosed = fromRight ? "translate-x-full" : "-translate-x-full";
  const panelOpen = "translate-x-0";

  const linkClass = (active: boolean) =>
    [
      "block rounded-full px-4 py-2.5 text-sm font-semibold transition",
      active
        ? "bg-brand-gold text-brand-navy shadow-md shadow-brand-gold/30"
        : "text-brand-navy/90 hover:bg-brand-gray hover:text-brand-navy",
    ].join(" ");

  const drawerPanel = (
    <>
      <button
        type="button"
        className={`fixed inset-0 z-[200] bg-brand-navy/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-label="إغلاق القائمة"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed top-0 z-[201] flex h-full w-[min(85vw,18rem)] flex-col border-brand-gray bg-brand-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${panelPosition} ${
          open ? panelOpen : panelClosed
        } ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
        aria-label="القائمة الجانبية"
        dir="rtl"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center justify-between border-b border-brand-gray px-4 py-3">
          <span className="font-bold text-brand-navy">
            {siteName ? siteName : "القائمة"}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-navy transition hover:bg-brand-gray"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="قائمة الأقسام">
          {items.length === 0 ? (
            <p className="px-2 py-3 text-sm text-brand-navy/50">
              لا عناصر في القائمة
            </p>
          ) : (
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
                      className={linkClass(active)}
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
          )}
        </nav>

        <div
          className="border-t border-brand-gray p-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <p className="mb-2 text-xs font-semibold text-brand-navy/60">
            روابط سريعة
          </p>
          <div className="flex flex-col gap-1 text-sm">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-brand-navy transition hover:bg-brand-gray"
            >
              حسابي
            </Link>
            <Link
              href={`${WP_STORE_ORIGIN}/cart/`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-brand-navy transition hover:bg-brand-gray"
            >
              سلة التسوق
            </Link>
            <Link
              href={WP_WISHLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-brand-navy transition hover:bg-brand-gray"
            >
              المفضلة
            </Link>
          </div>
        </div>
      </aside>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-navy transition hover:bg-brand-gold/20 hover:text-brand-gold md:hidden"
        aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        aria-expanded={open}
      >
        <MenuIcon open={open} />
      </button>

      {mounted && typeof document !== "undefined"
        ? createPortal(drawerPanel, document.body)
        : null}
    </>
  );
}

export function MobileNavDrawer(props: Props) {
  return (
    <Suspense fallback={<span className="h-9 w-9 md:hidden" aria-hidden />}>
      <DrawerInner {...props} />
    </Suspense>
  );
}
