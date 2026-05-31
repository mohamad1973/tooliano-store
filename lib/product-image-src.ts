/** مسارات وروابط صور منتجات الفيندور (محلي + WordPress) */

export const VENDOR_UPLOAD_PATH_PREFIX = "/uploads/vendors/";

const LOCAL_PATH_RE = /^([a-zA-Z]:\\|file:|\/Users\/|\/home\/)/i;

export function isVendorLocalImagePath(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.startsWith("uploads/vendors/")) return true;
  if (trimmed.startsWith(VENDOR_UPLOAD_PATH_PREFIX)) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.pathname.startsWith(VENDOR_UPLOAD_PATH_PREFIX);
  } catch {
    return false;
  }
}

/** مسار نسبي للعرض في next/image من public/ */
export function normalizeProductImageSrc(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (LOCAL_PATH_RE.test(trimmed)) return null;

  if (trimmed.startsWith("uploads/vendors/")) {
    return `/${trimmed}`;
  }
  if (trimmed.startsWith(VENDOR_UPLOAD_PATH_PREFIX)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith(VENDOR_UPLOAD_PATH_PREFIX)) {
      return parsed.pathname;
    }
    return trimmed;
  } catch {
    return null;
  }
}

/** رابط مطلق لـ WooCommerce عند النشر */
export function resolveAbsoluteProductImageUrl(
  url: string | null | undefined,
): string | null {
  const normalized = normalizeProductImageSrc(url);
  if (!normalized) {
    if (!url?.trim() || LOCAL_PATH_RE.test(url.trim())) return null;
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return null;
  }

  if (normalized.startsWith(VENDOR_UPLOAD_PATH_PREFIX)) {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";
    return `${origin}${normalized}`;
  }

  return normalized;
}

export function isValidProductImageUrl(
  url: string | null | undefined,
): boolean {
  if (!url?.trim()) return false;
  if (LOCAL_PATH_RE.test(url.trim())) return false;

  if (isVendorLocalImagePath(url)) {
    return normalizeProductImageSrc(url) !== null;
  }

  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
