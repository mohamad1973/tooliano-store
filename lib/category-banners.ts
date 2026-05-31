import type { ProductCategoryNavItem } from "@/types/category";

/** عدد بنرات الصفحة الرئيسية */
export const HOME_BANNER_COUNT = 5;

/**
 * مسارات الصور بالترتيب (0..4) — الملفات في public/banners/
 * الترتيب يطابق أول 5 تصنيفات من WooCommerce في الصفحة الرئيسية
 */
export const BANNER_IMAGE_PATHS = [
  "/banners/tools.jpg",
  "/banners/home-kitchen.jpg",
  "/banners/office.jpg",
  "/banners/electronics.jpg",
  "/banners/automotive.jpg",
] as const;

export function getBannerImageForIndex(index: number): string {
  return BANNER_IMAGE_PATHS[index] ?? BANNER_IMAGE_PATHS[0];
}

export function pickHomeBannerCategories(
  categories: ProductCategoryNavItem[],
): ProductCategoryNavItem[] {
  return categories.slice(0, HOME_BANNER_COUNT);
}

export function categoryProductsHref(slug: string): string {
  return `/products?category=${encodeURIComponent(slug)}`;
}
