import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { fetchProductCategories } from "@/lib/categories";
import {
  categoryProductsHref,
  pickHomeBannerCategories,
} from "@/lib/category-banners";
import {
  CONTENT_BLOCK_SLUGS,
  DEFAULT_FAQ,
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_HOME_BANNERS,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_HOW_IT_WORKS,
  DEFAULT_MARQUEE_PHRASES,
  DEFAULT_NAV_MENU,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_THEME_COLORS,
  DEFAULT_WALLET_POLICY,
} from "@/lib/cms/defaults";
import { PAGE_KEYS } from "@/lib/cms/page-blocks";
import { sanitizeRichHtml } from "@/lib/cms/sanitize";
import { resolveNavMenuItems } from "@/lib/cms/resolve-nav-menu";
import { CMS_CACHE_TAG } from "@/lib/cms/revalidate";
import type {
  FaqContent,
  FooterColumnView,
  HomeBannerView,
  HomeSectionView,
  HowItWorksContent,
  MarqueeItemView,
  NavMenuItemView,
  PageBlockView,
  SiteSettingsView,
  ThemeColorsView,
  WalletPolicyContent,
} from "@/lib/cms/types";
import { SITE_NAME } from "@/lib/constants";

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function loadSiteSettingsRaw(): Promise<SiteSettingsView> {
  const rows = await prisma.siteSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const get = (key: string, fallback: string) =>
    map.get(key) ?? DEFAULT_SITE_SETTINGS[key] ?? fallback;

  return {
    siteName: get("siteName", SITE_NAME),
    tagline: get("tagline", DEFAULT_SITE_SETTINGS.tagline),
    logoUrl: get("logoUrl", ""),
    marqueeEnabled: get("marqueeEnabled", "true") !== "false",
    metaDescription: get(
      "metaDescription",
      DEFAULT_SITE_SETTINGS.metaDescription,
    ),
  };
}

async function loadMarqueeItemsRaw(): Promise<MarqueeItemView[]> {
  const rows = await prisma.marqueeItem.findMany({
    orderBy: { sortOrder: "asc" },
  });
  if (rows.length === 0) {
    return DEFAULT_MARQUEE_PHRASES.map((text, i) => ({
      id: `default-${i}`,
      text,
      sortOrder: i,
      enabled: true,
    }));
  }
  return rows.map((r) => ({
    id: r.id,
    text: r.text,
    sortOrder: r.sortOrder,
    enabled: r.enabled,
  }));
}

async function loadHomeBannersRaw(): Promise<HomeBannerView[]> {
  const rows = await prisma.homeBanner.findMany({
    orderBy: { sortOrder: "asc" },
  });
  if (rows.length === 0) {
    return DEFAULT_HOME_BANNERS.map((b, i) => ({
      id: `default-${i}`,
      ...b,
      enabled: true,
    }));
  }
  return rows.map((r) => ({
    id: r.id,
    imageUrl: r.imageUrl,
    categorySlug: r.categorySlug,
    title: r.title,
    sortOrder: r.sortOrder,
    enabled: r.enabled,
  }));
}

async function loadHomeSectionsRaw(): Promise<HomeSectionView[]> {
  const rows = await prisma.homeSection.findMany({
    orderBy: { sortOrder: "asc" },
  });
  if (rows.length === 0) {
    return DEFAULT_HOME_SECTIONS.map((s) => ({
      id: `default-${s.key}`,
      ...s,
      visible: true,
    }));
  }
  return rows.map((r) => ({
    id: r.id,
    key: r.key,
    label: r.label,
    sortOrder: r.sortOrder,
    visible: r.visible,
  }));
}

async function loadContentBlockRaw<T extends { title?: string }>(
  slug: string,
  fallback: T,
): Promise<T> {
  const row = await prisma.contentBlock.findUnique({ where: { slug } });
  if (!row) return fallback;
  const parsed = parseJson<T>(row.body, fallback);
  return { ...parsed, title: row.title };
}

async function loadFooterRaw(): Promise<FooterColumnView[]> {
  const columns = await prisma.footerColumn.findMany({
    orderBy: { sortOrder: "asc" },
    include: { links: { orderBy: { sortOrder: "asc" } } },
  });
  if (columns.length === 0) {
    return DEFAULT_FOOTER_COLUMNS.map((col, ci) => ({
      id: `default-col-${ci}`,
      title: col.title,
      sortOrder: col.sortOrder,
      links: col.links.map((l, li) => ({
        id: `default-link-${ci}-${li}`,
        ...l,
      })),
    }));
  }
  return columns.map((c) => ({
    id: c.id,
    title: c.title,
    sortOrder: c.sortOrder,
    links: c.links.map((l) => ({
      id: l.id,
      label: l.label,
      href: l.href,
      sortOrder: l.sortOrder,
      external: l.external,
    })),
  }));
}

const cachedSettings = unstable_cache(loadSiteSettingsRaw, ["cms-settings"], {
  tags: [CMS_CACHE_TAG],
});
const cachedMarquee = unstable_cache(loadMarqueeItemsRaw, ["cms-marquee"], {
  tags: [CMS_CACHE_TAG],
});
const cachedBanners = unstable_cache(loadHomeBannersRaw, ["cms-banners"], {
  tags: [CMS_CACHE_TAG],
});
const cachedSections = unstable_cache(loadHomeSectionsRaw, ["cms-sections"], {
  tags: [CMS_CACHE_TAG],
});
const cachedFooter = unstable_cache(loadFooterRaw, ["cms-footer"], {
  tags: [CMS_CACHE_TAG],
});

export async function getSiteSettings(): Promise<SiteSettingsView> {
  return cachedSettings();
}

export async function getMarqueeItems(): Promise<MarqueeItemView[]> {
  const items = await cachedMarquee();
  return items.filter((i) => i.enabled);
}

export async function isMarqueeEnabled(): Promise<boolean> {
  const s = await getSiteSettings();
  return s.marqueeEnabled;
}

export async function getHomeBannersResolved(): Promise<
  { id: string; imageUrl: string; href: string; label: string }[]
> {
  const banners = (await cachedBanners()).filter((b) => b.enabled);
  let categories: Awaited<ReturnType<typeof fetchProductCategories>> = [];
  try {
    categories = pickHomeBannerCategories(await fetchProductCategories());
  } catch {
    /* */
  }

  return banners.map((banner, index) => {
    const cat = banner.categorySlug
      ? categories.find((c) => c.slug === banner.categorySlug)
      : categories[index];
    const slug = banner.categorySlug ?? cat?.slug ?? "";
    const label = banner.title ?? cat?.name ?? "تصفح";
    const href = slug ? categoryProductsHref(slug) : "/products";
    return {
      id: banner.id,
      imageUrl: banner.imageUrl,
      href,
      label,
    };
  });
}

export async function getHomeSections(): Promise<HomeSectionView[]> {
  const sections = await cachedSections();
  return sections.filter((s) => s.visible);
}

export async function getFaqContent(): Promise<FaqContent> {
  const cached = unstable_cache(
    () => loadContentBlockRaw(CONTENT_BLOCK_SLUGS.FAQ, DEFAULT_FAQ),
    ["cms-faq"],
    { tags: [CMS_CACHE_TAG] },
  );
  const data = await cached();
  return {
    title: data.title ?? DEFAULT_FAQ.title,
    items: data.items ?? DEFAULT_FAQ.items,
  };
}

export async function getHowItWorksContent(): Promise<HowItWorksContent> {
  const cached = unstable_cache(
    () =>
      loadContentBlockRaw(
        CONTENT_BLOCK_SLUGS.HOW_IT_WORKS,
        DEFAULT_HOW_IT_WORKS,
      ),
    ["cms-how-it-works"],
    { tags: [CMS_CACHE_TAG] },
  );
  const data = await cached();
  return {
    title: data.title ?? DEFAULT_HOW_IT_WORKS.title,
    steps: data.steps ?? DEFAULT_HOW_IT_WORKS.steps,
  };
}

export async function getWalletPolicyContent(): Promise<WalletPolicyContent> {
  const cached = unstable_cache(
    () =>
      loadContentBlockRaw(
        CONTENT_BLOCK_SLUGS.WALLET_POLICY,
        DEFAULT_WALLET_POLICY,
      ),
    ["cms-wallet-policy"],
    { tags: [CMS_CACHE_TAG] },
  );
  const data = await cached();
  return {
    title: data.title ?? DEFAULT_WALLET_POLICY.title,
    intro: data.intro ?? DEFAULT_WALLET_POLICY.intro,
    options: data.options ?? DEFAULT_WALLET_POLICY.options,
  };
}

export async function getFooterColumns(): Promise<FooterColumnView[]> {
  return cachedFooter();
}

async function loadNavMenuRaw(): Promise<NavMenuItemView[]> {
  const rows = await prisma.navMenuItem.findMany({
    orderBy: { sortOrder: "asc" },
  });
  if (rows.length === 0) {
    return DEFAULT_NAV_MENU.map((item, i) => ({
      id: `default-nav-${i}`,
      label: item.label,
      href: item.href,
      linkType: item.linkType,
      categorySlug: null,
      sortOrder: i,
      enabled: true,
    }));
  }
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    href: r.href,
    linkType: r.linkType,
    categorySlug: r.categorySlug,
    sortOrder: r.sortOrder,
    enabled: r.enabled,
  }));
}

const cachedNavMenu = unstable_cache(loadNavMenuRaw, ["cms-nav-menu"], {
  tags: [CMS_CACHE_TAG],
});

export async function getNavMenuItems(): Promise<NavMenuItemView[]> {
  const items = (await cachedNavMenu()).filter((i) => i.enabled);
  return resolveNavMenuItems(items);
}

async function loadThemeColorsRaw(): Promise<ThemeColorsView> {
  const rows = await prisma.siteSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const get = (key: keyof typeof DEFAULT_THEME_COLORS) =>
    map.get(key) ?? DEFAULT_THEME_COLORS[key];

  return {
    brandNavy: get("colorBrandNavy"),
    brandGold: get("colorBrandGold"),
    brandGray: get("colorBrandGray"),
    brandWhite: get("colorBrandWhite"),
    background: get("colorBackground"),
    foreground: get("colorForeground"),
  };
}

const cachedTheme = unstable_cache(loadThemeColorsRaw, ["cms-theme"], {
  tags: [CMS_CACHE_TAG],
});

export async function getThemeColors(): Promise<ThemeColorsView> {
  return cachedTheme();
}

async function loadPageBlocksRaw(pageKey: string): Promise<PageBlockView[]> {
  return prisma.pageBlock.findMany({
    where: { pageKey, enabled: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPageBlocks(pageKey = PAGE_KEYS.HOME): Promise<PageBlockView[]> {
  const cached = unstable_cache(
    () => loadPageBlocksRaw(pageKey),
    [`cms-page-blocks-${pageKey}`],
    { tags: [CMS_CACHE_TAG] },
  );
  return cached();
}

export async function getWalletPolicyContentSanitized(): Promise<WalletPolicyContent> {
  const content = await getWalletPolicyContent();
  const introHasHtml = /<[a-z][\s\S]*>/i.test(content.intro);
  return {
    ...content,
    intro: introHasHtml ? sanitizeRichHtml(content.intro) : content.intro,
  };
}
