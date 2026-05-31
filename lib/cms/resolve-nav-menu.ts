import "server-only";

import { fetchProductCategories } from "@/lib/categories";
import {
  extractCategorySlugFromHref,
  isSameStoreCategoryUrl,
  isWooCategoryHref,
  normalizeCategoryHref,
} from "@/lib/category-href";
import { slugFromLabel } from "@/lib/cms/nav-menu-slug";
import type { NavMenuItemView } from "@/lib/cms/types";
import type { ProductCategoryNavItem } from "@/types/category";

function resolveSlugForItem(
  item: NavMenuItemView,
  categories: ProductCategoryNavItem[],
  validSlugs: Set<string> | null,
): string | null {
  const fromField = item.categorySlug?.trim();
  if (fromField && (!validSlugs || validSlugs.has(fromField))) {
    return fromField;
  }

  const fromHref = extractCategorySlugFromHref(item.href);
  if (fromHref && (!validSlugs || validSlugs.has(fromHref))) {
    return fromHref;
  }

  const fromLabel = slugFromLabel(item.label, categories);
  if (fromLabel && (!validSlugs || validSlugs.has(fromLabel))) {
    return fromLabel;
  }

  return fromField || fromHref || fromLabel;
}

/**
 * يعيد بناء href لعناصر التصنيف (بأي linkType) ويحوّل روابط ووردبريس القديمة.
 */
export async function resolveNavMenuItems(
  items: NavMenuItemView[],
): Promise<NavMenuItemView[]> {
  let categories: ProductCategoryNavItem[] = [];
  let validSlugs: Set<string> | null = null;
  try {
    categories = await fetchProductCategories();
    validSlugs = new Set(categories.map((c) => c.slug));
  } catch {
    /* Woo غير متاح */
  }

  const resolved: NavMenuItemView[] = [];

  for (const item of items) {
    const looksLikeCategory =
      item.linkType === "category" ||
      isWooCategoryHref(item.href) ||
      (item.linkType === "external" && isSameStoreCategoryUrl(item.href));

    if (!looksLikeCategory) {
      resolved.push(item);
      continue;
    }

    const slug = resolveSlugForItem(item, categories, validSlugs);
    if (!slug) {
      if (item.linkType === "category") continue;
      resolved.push(item);
      continue;
    }

    resolved.push({
      ...item,
      linkType: "category",
      categorySlug: slug,
      href: normalizeCategoryHref(slug),
    });
  }

  return resolved;
}
