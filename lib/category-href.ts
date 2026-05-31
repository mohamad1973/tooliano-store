import { categoryProductsHref } from "@/lib/category-banners";
import { WP_STORE_ORIGIN } from "@/lib/constants";

/** يستخرج slug التصنيف من روابط Woo أو مسارات المتجر القديمة. */
export function extractCategorySlugFromHref(href: string): string | null {
  const raw = href.trim();
  if (!raw) return null;

  try {
    const url = raw.startsWith("http")
      ? new URL(raw)
      : new URL(raw.startsWith("/") ? raw : `/${raw}`, "https://local");

    const fromQuery = url.searchParams.get("category")?.trim();
    if (fromQuery) return fromQuery;

    const pathMatch =
      url.pathname.match(/\/product-category\/([^/]+)\/?$/i) ??
      url.pathname.match(/\/categories\/([^/]+)\/?$/i);
    if (pathMatch?.[1]) {
      return decodeURIComponent(pathMatch[1]).trim() || null;
    }
  } catch {
    /* */
  }

  const rel = raw.replace(/^https?:\/\/[^/]+/i, "");
  const qMatch = rel.match(/[?&]category=([^&]+)/i);
  if (qMatch?.[1]) return decodeURIComponent(qMatch[1]).trim() || null;

  const pathOnly =
    rel.match(/^\/?product-category\/([^/?#]+)/i) ??
    rel.match(/^\/?categories\/([^/?#]+)/i);
  if (pathOnly?.[1]) {
    return decodeURIComponent(pathOnly[1]).trim() || null;
  }

  return null;
}

/** هل الرابط يشير لتصنيف منتجات (محلي أو ووردبريس)؟ */
export function isWooCategoryHref(href: string): boolean {
  return extractCategorySlugFromHref(href) != null;
}

/** يحوّل أي رابط تصنيف إلى مسار المتجر Headless. */
export function normalizeCategoryHref(slug: string): string {
  return categoryProductsHref(slug.trim());
}

/** روابط ووردبريس لنفس المتجر — نعاملها كتصنيف داخلي على Next. */
export function isSameStoreCategoryUrl(href: string): boolean {
  const slug = extractCategorySlugFromHref(href);
  if (!slug) return false;
  if (!href.trim().startsWith("http")) return true;
  try {
    const origin = new URL(href.trim()).origin.replace(/\/$/, "");
    const store = WP_STORE_ORIGIN.replace(/\/$/, "");
    return origin === store;
  } catch {
    return false;
  }
}
