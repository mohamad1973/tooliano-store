import "server-only";

import {
  isVendorLocalImagePath,
  normalizeProductImageSrc,
} from "@/lib/product-image-src";
import { fetchProductById } from "@/lib/products";

function isBlockedDevUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

function isPublicHttpUrl(url: string): boolean {
  const t = url.trim();
  if (!t.startsWith("http://") && !t.startsWith("https://")) return false;
  return !isBlockedDevUrl(t);
}

/**
 * رابط عرض الصورة — لا يُصفَّر إلا إذا الحقل فارغ في قاعدة البيانات (حذف من الأدمن).
 * يحاول WooCommerce كاحتياط عند الروابط المحلية أو المكسورة.
 */
export async function resolveSubmissionDisplayImageUrl(
  productImageUrl: string | null | undefined,
  wooProductId: number | null | undefined,
): Promise<string | null> {
  if (productImageUrl === null || productImageUrl === "") {
    return null;
  }

  const trimmed = productImageUrl?.trim();
  if (trimmed && isPublicHttpUrl(trimmed)) {
    return normalizeProductImageSrc(trimmed) ?? trimmed;
  }

  if (wooProductId) {
    try {
      const product = await fetchProductById(wooProductId);
      const wooSrc = product?.thumbnail?.trim();
      if (wooSrc && isPublicHttpUrl(wooSrc)) {
        return wooSrc;
      }
    } catch {
      /* */
    }
  }

  if (!trimmed) return null;

  const normalized = normalizeProductImageSrc(trimmed);
  if (normalized && !isVendorLocalImagePath(trimmed)) {
    return normalized;
  }

  if (normalized && isVendorLocalImagePath(trimmed)) {
    const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    if (site && !site.includes("localhost")) {
      return `${site}${normalized}`;
    }
    return normalized;
  }

  return null;
}
