"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { ProductCategoryNavItem } from "@/types/category";

type Props = {
  categories: ProductCategoryNavItem[];
};

function NavInner({ categories }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category") ?? "";
  const onProducts = pathname === "/products";

  const linkClass = (active: boolean) =>
    [
      "whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition sm:px-3 sm:py-1.5 sm:text-xs",
      active
        ? "bg-brand-gold text-brand-navy shadow-md shadow-brand-gold/30"
        : "text-brand-navy/80 hover:bg-brand-gray hover:text-brand-navy",
    ].join(" ");

  return (
    <nav
      className="flex max-w-full flex-nowrap items-center justify-start gap-1 sm:gap-1.5"
      aria-label="تصنيفات المنتجات"
    >
      <Link
        href="/products"
        className={linkClass(onProducts && activeSlug === "")}
        prefetch={false}
      >
        الكل
      </Link>
      {categories.map((cat) => {
        const active = onProducts && activeSlug === cat.slug;
        return (
          <Link
            key={cat.id}
            href={`/products?category=${encodeURIComponent(cat.slug)}`}
            className={linkClass(active)}
            prefetch={false}
          >
            {cat.name}
          </Link>
        );
      })}
    </nav>
  );
}

export function HeaderCategoryNav(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex h-8 flex-nowrap gap-2">
          {props.categories.slice(0, 8).map((c) => (
            <span
              key={c.id}
              className="h-7 w-14 shrink-0 animate-pulse rounded-full bg-brand-gray"
            />
          ))}
        </div>
      }
    >
      <NavInner {...props} />
    </Suspense>
  );
}
