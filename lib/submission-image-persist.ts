import "server-only";

import type { ProductSubmission } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  isVendorLocalImagePath,
  normalizeProductImageSrc,
} from "@/lib/product-image-src";
import { fetchProductById } from "@/lib/products";
import { resolveWooProductImageSrc } from "@/lib/woo-product-image";
import { isWordPressMediaUploadConfigured } from "@/lib/wp-media-config";

function isPersistedPublicUrl(url: string): boolean {
  const t = url.trim();
  if (!t.startsWith("http://") && !t.startsWith("https://")) return false;
  try {
    const host = new URL(t).hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return false;
  }
}

/** يحفظ رابط صورة دائم (WordPress) في قاعدة البيانات. */
export async function updateSubmissionProductImageUrl(
  submissionId: string,
  imageUrl: string,
): Promise<void> {
  await prisma.productSubmission.update({
    where: { id: submissionId },
    data: { productImageUrl: imageUrl },
  });
}

/** بعد النشر على Woo — مزامنة رابط الصورة من المنتج. */
export async function syncSubmissionImageFromWooProduct(
  submissionId: string,
  wooProductId: number,
): Promise<string | null> {
  const product = await fetchProductById(wooProductId);
  const src = product?.thumbnail?.trim();
  if (!src || !isPersistedPublicUrl(src)) return null;
  await updateSubmissionProductImageUrl(submissionId, src);
  return src;
}

/**
 * يرفع الصورة المحلية إلى WordPress ويحدّث productImageUrl.
 * لا يمسح الصورة أبداً — يفشل بهدوء إن لم يُضبط WP.
 */
export async function ensureSubmissionImageOnWordPress(
  submission: Pick<ProductSubmission, "id" | "productImageUrl" | "wooProductId">,
): Promise<string | null> {
  const current = submission.productImageUrl?.trim();
  if (current && isPersistedPublicUrl(current) && !isVendorLocalImagePath(current)) {
    return current;
  }

  if (submission.wooProductId) {
    const synced = await syncSubmissionImageFromWooProduct(
      submission.id,
      submission.wooProductId,
    );
    if (synced) return synced;
  }

  if (!current || !isVendorLocalImagePath(current)) {
    return current && isPersistedPublicUrl(current) ? current : null;
  }

  if (!isWordPressMediaUploadConfigured()) {
    return null;
  }

  try {
    const wpUrl = await resolveWooProductImageSrc(current);
    if (wpUrl && isPersistedPublicUrl(wpUrl)) {
      await updateSubmissionProductImageUrl(submission.id, wpUrl);
      return wpUrl;
    }
  } catch (e) {
    console.error("[ensureSubmissionImageOnWordPress]", submission.id, e);
  }

  return null;
}

/** للعرض في الأدمن — يُظهر الرابط الخام دون إسقاطه. */
export function getSubmissionImageUrlForAdmin(
  productImageUrl: string | null | undefined,
): string | null {
  if (!productImageUrl?.trim()) return null;
  const trimmed = productImageUrl.trim();
  if (isPersistedPublicUrl(trimmed)) return trimmed;
  return normalizeProductImageSrc(trimmed) ?? trimmed;
}
