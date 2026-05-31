/**
 * إصلاح ومزامنة روابط التصنيفات في CMS (منيو + بنرات) على قاعدة الإنتاج.
 * الاستخدام: npm run cms:repair-categories
 */
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { WC_REST_BASE_PATH } from "../lib/constants";
import { categoryProductsHref, HOME_BANNER_COUNT } from "../lib/category-banners";
import {
  extractCategorySlugFromHref,
  isSameStoreCategoryUrl,
  isWooCategoryHref,
  normalizeCategoryHref,
} from "../lib/category-href";
import { slugFromLabel } from "../lib/cms/nav-menu-slug";
import type { ProductCategoryNavItem } from "../types/category";
import { loadEnvLocal, requireEnv } from "./lib/load-env-local";

type WooCat = { id: number; name: string; slug: string; parent: number; menu_order?: number };

async function fetchWooCategories(): Promise<ProductCategoryNavItem[]> {
  const baseURL = requireEnv("WC_BASE_URL").replace(/\/$/, "");
  const key = requireEnv("WC_CONSUMER_KEY");
  const secret = requireEnv("WC_CONSUMER_SECRET");
  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  const apiBase = new URL(WC_REST_BASE_PATH, `${baseURL}/`).toString();

  const woo = axios.create({
    baseURL: apiBase,
    timeout: 25_000,
    headers: { Authorization: `Basic ${token}` },
  });

  const { data } = await woo.get<WooCat[]>("/products/categories", {
    params: { per_page: 100, hide_empty: false, orderby: "name", order: "asc" },
  });

  const rows = Array.isArray(data) ? data : [];
  const cleaned = rows.filter((r) => {
    const s = r.slug?.toLowerCase() ?? "";
    return s !== "uncategorized" && s !== "غير-مصنف";
  });

  const parents = cleaned.filter((r) => r.parent === 0);
  const chosen = parents.length > 0 ? parents : cleaned;
  return chosen
    .slice(0, 28)
    .map((r) => ({ id: r.id, name: r.name, slug: r.slug, count: 0 }));
}

async function main() {
  loadEnvLocal();
  requireEnv("DATABASE_URL");

  const prisma = new PrismaClient();
  const categories = await fetchWooCategories();
  const validSlugs = new Set(categories.map((c) => c.slug));
  const bannerCategories = categories.slice(0, HOME_BANNER_COUNT);

  const banners = await prisma.homeBanner.findMany({ orderBy: { sortOrder: "asc" } });
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

  const existing = await prisma.navMenuItem.findMany({ orderBy: { sortOrder: "asc" } });
  const categoryItems = existing.filter((e) => e.linkType === "category");
  let menuUpdated = 0;
  let menuCreated = 0;
  let menuDisabled = 0;

  const maxOrder = await prisma.navMenuItem.aggregate({ _max: { sortOrder: true } });
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
        data: { ...data, linkType: "category", sortOrder: nextSortOrder++ },
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

  const allItems = await prisma.navMenuItem.findMany();
  let menuRepaired = 0;
  for (const item of allItems) {
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
    if (
      item.href !== href ||
      item.categorySlug !== slug ||
      item.linkType !== "category"
    ) {
      await prisma.navMenuItem.update({
        where: { id: item.id },
        data: { href, categorySlug: slug, linkType: "category" },
      });
      menuRepaired++;
    }
  }

  await prisma.$disconnect();

  console.log(
    JSON.stringify(
      {
        categoriesCount: categories.length,
        bannersUpdated,
        menuUpdated,
        menuCreated,
        menuDisabled,
        menuRepaired,
        sampleSlugs: categories.slice(0, 5).map((c) => c.slug),
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
