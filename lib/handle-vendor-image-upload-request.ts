import {
  resolveVendorImageUploadStorage,
  uploadVendorProductImage,
} from "@/lib/vendor-image-upload";

export async function handleVendorImageUploadRequest(
  request: Request,
): Promise<{ url: string; storage: string }> {
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
