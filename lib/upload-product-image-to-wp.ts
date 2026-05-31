import "server-only";

import path from "path";
import {
  validateVendorImageFile,
  type VendorImageUploadInput,
} from "@/lib/vendor-image-upload";
import { isWordPressMediaUploadConfigured } from "@/lib/wp-media-config";
import { uploadToWordPressMedia } from "@/lib/wp-upload-media";

export type ProductImageUploadResult = {
  url: string;
  storage: "wordpress";
};

function sanitizeFilename(name: string): string {
  const base = path.basename(name).replace(/[^\w.\-()+\s]/g, "_");
  return base.slice(0, 120) || "image.jpg";
}

export async function parseProductImageFromRequest(
  request: Request,
): Promise<VendorImageUploadInput> {
  const formData = await request.formData();
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    throw new Error("لم يُرسل ملف صورة");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    buffer,
    mimeType: file.type || "application/octet-stream",
    originalName: file.name || "product.jpg",
  };
}

/** رفع إلى WordPress Media وإرجاع source_url */
export async function uploadProductImageToWordPress(
  input: VendorImageUploadInput,
): Promise<ProductImageUploadResult> {
  const validationError = validateVendorImageFile(
    input.mimeType,
    input.buffer.length,
  );
  if (validationError) {
    throw new Error(validationError);
  }

  if (!isWordPressMediaUploadConfigured()) {
    throw new Error(
      "إعدادات WordPress غير مكتملة — أضف WP_URL و WP_USERNAME و WP_APP_PASSWORD على Vercel",
    );
  }

  const url = await uploadToWordPressMedia({
    buffer: input.buffer,
    mimeType: input.mimeType,
    filename: sanitizeFilename(input.originalName),
  });

  return { url, storage: "wordpress" };
}

export async function uploadProductImageFromRequest(
  request: Request,
): Promise<ProductImageUploadResult> {
  const input = await parseProductImageFromRequest(request);
  return uploadProductImageToWordPress(input);
}
