import Link from "next/link";
import { fetchProductCategories } from "@/lib/categories";
import { SITE_NAME } from "@/lib/constants";
import { HeaderCategoryNav } from "@/components/HeaderCategoryNav";
import { HeaderIconsSocial } from "@/components/HeaderIconsSocial";
import { TopMarquee } from "@/components/TopMarquee";

export async function SiteHeader() {
  let categories: Awaited<ReturnType<typeof fetchProductCategories>> = [];
  try {
    categories = await fetchProductCategories();
  } catch {
    /* يبقى الهيدر بدون تصنيفات إن فشل الـ API */
  }

  return (
    <div className="sticky top-0 z-50 shadow-[0_4px_24px_-8px_rgba(20,33,61,0.2)]">
      <TopMarquee />
      <header className="border-b border-brand-gray bg-brand-white backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-2 py-2 sm:px-3 sm:py-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="shrink-0">
              <Link
                href="/"
                className="group flex flex-col leading-tight transition hover:opacity-90"
              >
                <span className="text-lg font-bold text-brand-navy sm:text-xl">
                  {SITE_NAME}
                </span>
                <span className="text-[10px] font-medium text-brand-navy/60 sm:text-xs">
                  أدوات المنزل العصرية
                </span>
              </Link>
            </div>

            <div className="min-h-[2.5rem] min-w-0 flex-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand-gold/60">
              {categories.length > 0 ? (
                <div className="inline-flex min-w-max rounded-2xl border border-brand-gray bg-brand-white px-1.5 py-1 shadow-sm sm:px-2">
                  <HeaderCategoryNav categories={categories} />
                </div>
              ) : (
                <p className="flex h-9 items-center text-center text-[11px] text-brand-navy/50">
                  التصنيفات غير متاحة حالياً
                </p>
              )}
            </div>

            <HeaderIconsSocial />
          </div>
        </div>
      </header>
    </div>
  );
}
