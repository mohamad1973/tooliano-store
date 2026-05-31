import "server-only";

import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import {
  normalizeProductImageSrc,
  VENDOR_UPLOAD_PATH_PREFIX,
} from "@/lib/product-image-src";
import { isWordPressMediaUploadConfigured } from "@/lib/wp-media-config";
import { uploadToWordPressMedia } from "@/lib/wp-upload-media";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function isLocalhostUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

/**
 * يحضّر رابط صورة يمكن لـ WooCommerce على tooliano.com تحميله.
 * الصور المحلية (/uploads/vendors/) تُرفع أولاً إلى WordPress Media.
 */
export async function resolveWooProductImageSrc(
  productImageUrl: string | null | undefined,
): Promise<string | null> {
  if (!productImageUrl?.trim()) return null;

  const trimmed = productImageUrl.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (!isLocalhostUrl(trimmed)) {
      return trimmed;
    }
    try {
      const pathname = new URL(trimmed).pathname;
      return resolveWooProductImageSrc(pathname);
    } catch {
      return null;
    }
  }

  const localPath = normalizeProductImageSrc(trimmed);
  if (!localPath?.startsWith(VENDOR_UPLOAD_PATH_PREFIX)) {
    return null;
  }

  if (!isWordPressMediaUploadConfigured()) {
    throw new Error(
      "صورة المنتج محفوظة محلياً — أضف WP_MEDIA_USER و WP_APP_PASSWORD في .env.local لنشرها على WordPress",
    );
  }

  const relative = localPath.replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", relative);
  if (!existsSync(filePath)) {
    throw new Error(
      "ملف الصورة غير موجود على السيرفر — اطلب من التاجر إعادة رفع الصورة",
    );
  }

  const ext = path.extname(filePath).toLowerCase();
  const buffer = await readFile(filePath);
  return uploadToWordPressMedia({
    buffer,
    mimeType: MIME_BY_EXT[ext] ?? "image/jpeg",
    filename: path.basename(filePath),
  });
}
