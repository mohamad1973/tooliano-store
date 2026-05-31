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
    return "مسار اللابتوب المحلي غير مقبول — استخدم رابط https عاماً";
  }
  if (!isValidProductImageUrl(url)) {
    return "أدخل رابط https صالح للصورة";
  }
  return null;
}
