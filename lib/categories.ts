import "server-only";

import { createWooClient } from "@/lib/woo-client";
import type {
  ProductCategoryNavItem,
  WCProductCategoryRow,
} from "@/types/category";

/** يطابق عدد التصنيفات المعروضة في ووردبريس قدر الإمكان */
const MAX_CATEGORIES = 100;
/** حد أقصى لعناصر المنيو حتى لا يزدحم الهيدر */
const MAX_MENU_CATEGORIES = 28;

const UNCATEGORIZED_SLUGS = new Set(["uncategorized", "غير-مصنف"]);

function toNavItem(row: WCProductCategoryRow): ProductCategoryNavItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    count: row.count,
  };
}

function isUncategorized(row: WCProductCategoryRow): boolean {
  const s = row.slug?.toLowerCase() ?? "";
  return UNCATEGORIZED_SLUGS.has(s) || s === "uncategorized-ar";
}

function sortForMenu(a: WCProductCategoryRow, b: WCProductCategoryRow): number {
  const orderA = a.menu_order ?? 0;
  const orderB = b.menu_order ?? 0;
  if (orderA !== orderB) return orderA - orderB;
  return a.name.localeCompare(b.name, "ar");
}

/**
 * يجلب تصنيفات المنتجات من WooCommerce على الموقع الرئيسي (WC_BASE_URL).
 * hide_empty=false حتى تظهر التصنيفات حتى لو كان عدّ WooCommerce لها صفراً.
 */
export async function fetchProductCategories(): Promise<
  ProductCategoryNavItem[]
> {
  const woo = createWooClient();
  const response = await woo.get<WCProductCategoryRow[]>(
    "/products/categories",
    {
      params: {
        per_page: MAX_CATEGORIES,
        hide_empty: false,
        orderby: "name",
        order: "asc",
      },
    },
  );

  const rows = Array.isArray(response.data) ? response.data : [];
  const cleaned = rows.filter((r) => !isUncategorized(r));

  const parents = cleaned
    .filter((r) => r.parent === 0)
    .sort(sortForMenu);

  const chosen =
    parents.length > 0
      ? parents
      : [...cleaned].sort(sortForMenu);

  return chosen.slice(0, MAX_MENU_CATEGORIES).map(toNavItem);
}

export async function fetchCategoryBySlug(
  slug: string,
): Promise<ProductCategoryNavItem | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  const woo = createWooClient();
  const response = await woo.get<WCProductCategoryRow[]>(
    "/products/categories",
    {
      params: { slug: trimmed, per_page: 1 },
    },
  );

  const row = response.data[0];
  return row ? toNavItem(row) : null;
}
