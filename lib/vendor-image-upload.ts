import "server-only";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { uploadToWordPressMedia } from "@/lib/wp-upload-media";

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
): Promise<VendorImageUploadResult> {
  const validationError = validateVendorImageFile(
    input.mimeType,
    input.buffer.length,
  );
  if (validationError) {
    throw new Error(validationError);
  }

  const wpConfigured =
    Boolean(process.env.WP_APP_PASSWORD?.trim()) &&
    Boolean(
      (process.env.WP_MEDIA_USER ?? process.env.WP_MEDIA_USERNAME)?.trim(),
    );

  if (wpConfigured) {
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
