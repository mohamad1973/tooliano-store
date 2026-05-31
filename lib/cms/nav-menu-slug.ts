import type { ProductCategoryNavItem } from "@/types/category";

export function slugFromLabel(
  label: string,
  categories: ProductCategoryNavItem[],
): string | null {
  const normalized = label.trim().toLowerCase();
  if (!normalized) return null;
  const match = categories.find(
    (c) => c.name.trim().toLowerCase() === normalized,
  );
  return match?.slug ?? null;
}
