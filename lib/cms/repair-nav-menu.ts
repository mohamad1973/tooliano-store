import "server-only";

import { prisma } from "@/lib/db/prisma";
import { fetchProductCategories } from "@/lib/categories";
import {
  extractCategorySlugFromHref,
  isSameStoreCategoryUrl,
  isWooCategoryHref,
  normalizeCategoryHref,
} from "@/lib/category-href";
import { slugFromLabel } from "@/lib/cms/nav-menu-slug";

export type RepairNavMenuResult = { repaired: number };

/** يحدّث href و categorySlug في قاعدة البيانات للعناصر ذات روابط التصنيف القديمة. */
export async function repairNavMenuLinksInDb(): Promise<RepairNavMenuResult> {
  const categories = await fetchProductCategories();
  const validSlugs = new Set(categories.map((c) => c.slug));
  const items = await prisma.navMenuItem.findMany();

  let repaired = 0;

  for (const item of items) {
    const looksLikeCategory =
      item.linkType === "category" ||
      isWooCategoryHref(item.href) ||
      (item.linkType === "external" && isSameStoreCategoryUrl(item.href));

    if (!looksLikeCategory) continue;

    let slug =
      item.categorySlug?.trim() ||
      extractCategorySlugFromHref(item.href) ||
      slugFromLabel(item.label, categories) ||
      null;

    if (slug && !validSlugs.has(slug)) {
      const byLabel = slugFromLabel(item.label, categories);
      if (byLabel) slug = byLabel;
    }

    if (!slug || !validSlugs.has(slug)) continue;

    const href = normalizeCategoryHref(slug);
    const needsUpdate =
      item.href !== href ||
      item.categorySlug !== slug ||
      item.linkType !== "category";

    if (needsUpdate) {
      await prisma.navMenuItem.update({
        where: { id: item.id },
        data: {
          href,
          categorySlug: slug,
          linkType: "category",
        },
      });
      repaired++;
    }
  }

  return { repaired };
}
