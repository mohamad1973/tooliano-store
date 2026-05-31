import {
  resolveVendorImageUploadStorage,
  uploadVendorProductImage,
} from "@/lib/vendor-image-upload";
import { uploadProductImageFromRequest } from "@/lib/upload-product-image-to-wp";
import { isWordPressMediaUploadConfigured } from "@/lib/wp-media-config";

export type HandleVendorImageUploadOptions = {
  /** رفع مباشر إلى WordPress Media (مسار /api/upload والتاجر/الأدمن على Vercel) */
  forceWordPress?: boolean;
};

export async function handleVendorImageUploadRequest(
  request: Request,
  options: HandleVendorImageUploadOptions = {},
): Promise<{ url: string; storage: string }> {
  if (options.forceWordPress) {
    return uploadProductImageFromRequest(request);
  }

  if (isWordPressMediaUploadConfigured()) {
    const storage = resolveVendorImageUploadStorage();
    if (storage === "wordpress") {
      return uploadProductImageFromRequest(request);
    }
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    throw new Error("لم يُرسل ملف صورة");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storage = resolveVendorImageUploadStorage();
  const result = await uploadVendorProductImage(
    {
      buffer,
      mimeType: file.type || "application/octet-stream",
      originalName: file.name || "product.jpg",
    },
    { storage },
  );

  return { url: result.url, storage: result.storage };
}
