"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

export function HeaderSearchDropdown() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= 2;

  useEffect(() => {
    if (!canSearch) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          search: trimmedQuery,
          per_page: "6",
        });
        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as Product[];
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if ((err as DOMException).name === "AbortError") return;
        setResults([]);
        setError("تعذّر تحميل نتائج البحث");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [canSearch, trimmedQuery]);

  return (
    <div className="group/search relative" dir="rtl">
      <button
        type="button"
        aria-label="بحث"
        className="flex h-8 w-8 items-center justify-center rounded-full text-brand-gold transition hover:bg-brand-gold/20 hover:text-brand-gold sm:h-9 sm:w-9"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      <div className="invisible absolute end-0 top-full z-[120] mt-2 w-[min(100vw-2rem,22rem)] translate-y-1 opacity-0 transition duration-150 group-hover/search:visible group-hover/search:translate-y-0 group-hover/search:opacity-100 group-focus-within/search:visible group-focus-within/search:translate-y-0 group-focus-within/search:opacity-100">
        <form
          action="/products"
          method="get"
          onSubmit={(e) => {
            if (!trimmedQuery) e.preventDefault();
          }}
          className="rounded-2xl border border-brand-gold/40 bg-brand-white p-3 shadow-xl"
        >
          <label className="mb-2 block text-xs font-semibold text-brand-navy">
            ابحث عن منتج أو أي كلمة في الموقع
          </label>
          <div className="flex items-center gap-2">
            <input
              type="search"
              name="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب كلمة البحث..."
              className="min-w-0 flex-1 rounded-xl border border-brand-gray px-3 py-2 text-sm text-brand-navy outline-none transition focus:border-brand-gold"
            />
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold text-brand-navy transition hover:bg-brand-gold/90"
              aria-label="تنفيذ البحث"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>

          <div className="mt-3 overflow-hidden rounded-xl border border-brand-gray/70 bg-brand-white">
            {!trimmedQuery ? (
              <p className="px-3 py-3 text-xs text-brand-navy/60">
                ابدأ الكتابة لعرض النتائج فوراً.
              </p>
            ) : !canSearch ? (
              <p className="px-3 py-3 text-xs text-brand-navy/60">
                اكتب حرفين على الأقل للبحث.
              </p>
            ) : loading ? (
              <p className="px-3 py-3 text-xs text-brand-navy/60">
                جاري البحث...
              </p>
            ) : error ? (
              <p className="px-3 py-3 text-xs text-red-600">{error}</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-3 text-xs text-brand-navy/60">
                لا توجد نتائج مطابقة.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.id}`}
                      className="flex gap-3 border-b border-brand-gray/60 px-3 py-2 transition last:border-b-0 hover:bg-brand-gray/30"
                    >
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-gray">
                        {product.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.thumbnail}
                            alt={product.imageAlt || product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[10px] text-brand-navy/40">
                            بدون صورة
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-xs font-semibold leading-snug text-brand-navy">
                          {product.name}
                        </span>
                        <span className="mt-1 block text-xs font-bold text-brand-gold">
                          {formatCurrency(product.price)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {canSearch ? (
            <Link
              href={`/products?search=${encodeURIComponent(trimmedQuery)}`}
              className="mt-2 block text-center text-xs font-bold text-brand-gold hover:underline"
            >
              عرض كل نتائج البحث
            </Link>
          ) : null}
        </form>
      </div>
    </div>
  );
}
