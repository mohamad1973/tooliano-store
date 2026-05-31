/** التحقق من أن رابط الصورة صالح للعرض على الويب و WooCommerce */

import {
  isValidProductImageUrl,
  normalizeProductImageSrc,
} from "@/lib/product-image-src";

const LOCAL_PATH_RE = /^([a-zA-Z]:\\|file:|\/Users\/|\/home\/)/i;

export { normalizeProductImageSrc, isValidProductImageUrl };

export function isValidPublicImageUrl(url: string | null | undefined): boolean {
  return isValidProductImageUrl(url);
}

export function validatePublicImageUrl(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) return "رابط الصورة مطلوب";
  if (LOCAL_PATH_RE.test(url.trim())) {
    return "مسار اللابتوب المحلي غير مقبول — ارفع الصورة من جهازك";
  }
  if (!isValidProductImageUrl(url)) {
    return "صورة المنتج غير صالحة — ارفع ملفاً من جهازك";
  }
  return null;
}
