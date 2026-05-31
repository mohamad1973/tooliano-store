import "server-only";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { isWordPressMediaUploadConfigured } from "@/lib/wp-media-config";
import { uploadToWordPressMedia } from "@/lib/wp-upload-media";

export { isWordPressMediaUploadConfigured };

export const VENDOR_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export type VendorImageUploadInput = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
};

export type VendorImageUploadResult = {
  url: string;
  storage: "wordpress" | "local";
};

export type VendorImageUploadOptions = {
  /**
   * local — حفظ في public/uploads/vendors (افتراضي عند رفع من النموذج).
   * wordpress — رفع إلى وسائط WordPress (عند النشر/المزامنة الصريحة فقط).
   */
  storage?: "local" | "wordpress";
};

/** Vercel / serverless — لا قرص دائم لـ public/uploads */
export function isEphemeralServerRuntime(): boolean {
  if (process.env.VERCEL === "1") return true;
  const storage = process.env.VENDOR_IMAGE_STORAGE?.trim().toLowerCase();
  if (storage === "local") return false;
  if (storage === "wordpress") return true;
  return process.env.NODE_ENV === "production";
}

/**
 * محلي على التطوير؛ WordPress Media على Vercel/الإنتاج.
 * تجاوز: VENDOR_IMAGE_STORAGE=local|wordpress
 */
export function resolveVendorImageUploadStorage(): "local" | "wordpress" {
  const override = process.env.VENDOR_IMAGE_STORAGE?.trim().toLowerCase();
  if (override === "local") return "local";
  if (override === "wordpress") return "wordpress";

  if (isEphemeralServerRuntime()) {
    return "wordpress";
  }

  return "local";
}

export function assertVendorImageUploadReady(
  storage: "local" | "wordpress",
): void {
  if (storage !== "wordpress") return;
  if (isWordPressMediaUploadConfigured()) return;

  if (isEphemeralServerRuntime()) {
    throw new Error(
      "على Vercel لا يُحفظ الملف على القرص — أضف WP_URL و WP_USERNAME و WP_APP_PASSWORD في Vercel (راجع docs/WORDPRESS-MEDIA-SETUP.md)",
    );
  }

  throw new Error(
    "إعدادات WordPress Media غير مكتملة — راجع WP_URL و WP_USERNAME و WP_APP_PASSWORD",
  );
}

export function validateVendorImageFile(
  mimeType: string,
  sizeBytes: number,
): string | null {
  if (!ALLOWED_MIME.has(mimeType)) {
    return "نوع الملف غير مدعوم — استخدم JPG أو PNG أو WebP";
  }
  if (sizeBytes > VENDOR_IMAGE_MAX_BYTES) {
    return "حجم الصورة يجب ألا يتجاوز 5 ميجابايت";
  }
  if (sizeBytes < 1) {
    return "الملف فارغ";
  }
  return null;
}

function sanitizeFilename(name: string): string {
  const base = path.basename(name).replace(/[^\w.\-()+\s]/g, "_");
  return base.slice(0, 120) || "image.jpg";
}

export async function uploadVendorProductImage(
  input: VendorImageUploadInput,
  options: VendorImageUploadOptions = { storage: "local" },
): Promise<VendorImageUploadResult> {
  const validationError = validateVendorImageFile(
    input.mimeType,
    input.buffer.length,
  );
  if (validationError) {
    throw new Error(validationError);
  }

  const target = options.storage ?? resolveVendorImageUploadStorage();
  assertVendorImageUploadReady(target);

  if (target === "wordpress") {
    const wpUrl = await uploadToWordPressMedia({
      buffer: input.buffer,
      mimeType: input.mimeType,
      filename: sanitizeFilename(input.originalName),
    });
    return { url: wpUrl, storage: "wordpress" };
  }

  return uploadVendorImageLocally(input);
}

async function uploadVendorImageLocally(
  input: VendorImageUploadInput,
): Promise<VendorImageUploadResult> {
  const ext = EXT_BY_MIME[input.mimeType] ?? ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "vendors");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), input.buffer);

  return {
    url: `/uploads/vendors/${filename}`,
    storage: "local",
  };
}
