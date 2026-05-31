import "server-only";

import { prisma } from "@/lib/db/prisma";
import { fetchProductCategories } from "@/lib/categories";
import { repairNavMenuLinksInDb } from "@/lib/cms/repair-nav-menu";
import {
  categoryProductsHref,
  HOME_BANNER_COUNT,
} from "@/lib/category-banners";

export type SyncWooCategoriesResult = {
  categoriesCount: number;
  bannersUpdated: number;
  menuUpdated: number;
  menuCreated: number;
  menuDisabled: number;
  menuRepaired: number;
};

/**
 * يزامن slugs التصنيفات من WooCommerce إلى بنرات الرئيسية وعناصر المنيو من نوع category.
 */
export async function syncWooCategoriesToCms(): Promise<SyncWooCategoriesResult> {
  const categories = await fetchProductCategories();
  const bannerCategories = categories.slice(0, HOME_BANNER_COUNT);

  const banners = await prisma.homeBanner.findMany({
    orderBy: { sortOrder: "asc" },
  });

  let bannersUpdated = 0;
  for (let i = 0; i < banners.length && i < bannerCategories.length; i++) {
    const slug = bannerCategories[i].slug;
    if (banners[i].categorySlug !== slug) {
      await prisma.homeBanner.update({
        where: { id: banners[i].id },
        data: { categorySlug: slug },
      });
      bannersUpdated++;
    }
  }

  const existing = await prisma.navMenuItem.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const categoryItems = existing.filter((e) => e.linkType === "category");

  let menuUpdated = 0;
  let menuCreated = 0;
  let menuDisabled = 0;

  const maxOrder = await prisma.navMenuItem.aggregate({
    _max: { sortOrder: true },
  });
  let nextSortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const href = categoryProductsHref(cat.slug);
    const data = {
      label: cat.name,
      href,
      categorySlug: cat.slug,
      enabled: true,
    };

    if (i < categoryItems.length) {
      await prisma.navMenuItem.update({
        where: { id: categoryItems[i].id },
        data,
      });
      menuUpdated++;
    } else {
      await prisma.navMenuItem.create({
        data: {
          ...data,
          linkType: "category",
          sortOrder: nextSortOrder++,
        },
      });
      menuCreated++;
    }
  }

  for (let i = categories.length; i < categoryItems.length; i++) {
    await prisma.navMenuItem.update({
      where: { id: categoryItems[i].id },
      data: { enabled: false },
    });
    menuDisabled++;
  }

  const { repaired: menuRepaired } = await repairNavMenuLinksInDb();

  return {
    categoriesCount: categories.length,
    bannersUpdated,
    menuUpdated,
    menuCreated,
    menuDisabled,
    menuRepaired,
  };
}
