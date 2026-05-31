import Image from "next/image";
import Link from "next/link";
import { fetchProductCategories } from "@/lib/categories";
import {
  categoryProductsHref,
  getBannerImageForIndex,
  pickHomeBannerCategories,
} from "@/lib/category-banners";

export async function CategoryBanners() {
  let categories: Awaited<ReturnType<typeof fetchProductCategories>> = [];
  try {
    categories = pickHomeBannerCategories(await fetchProductCategories());
  } catch {
    return null;
  }

  if (categories.length === 0) return null;

  return (
    <section
      className="w-full border-b border-brand-gray bg-brand-white px-3 py-4 sm:px-4 sm:py-5"
      aria-label="تصنيفات المتجر"
    >
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {categories.map((cat, index) => (
          <Link
            key={cat.id}
            href={categoryProductsHref(cat.slug)}
            className="group flex flex-col overflow-hidden rounded-xl border border-brand-gray bg-brand-white shadow-sm transition hover:border-brand-gold/50 hover:shadow-md"
          >
            <div className="relative aspect-[5/3] w-full overflow-hidden bg-brand-navy sm:aspect-[4/3]">
              <Image
                src={getBannerImageForIndex(index)}
                alt={cat.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                priority={index < 2}
              />
              <div className="absolute inset-0 bg-brand-navy/10 transition group-hover:bg-brand-navy/0" />
            </div>
            <p className="border-t border-brand-gray bg-brand-white px-2 py-2.5 text-center text-xs font-bold text-brand-navy transition group-hover:bg-brand-gold group-hover:text-brand-navy sm:py-3 sm:text-sm">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
