import { NextResponse } from "next/server";
import { handleVendorImageUploadRequest } from "@/lib/handle-vendor-image-upload-request";

/** رفع صورة أول منتج أثناء التسجيل (قبل إنشاء الجلسة) */
export async function POST(request: Request) {
  try {
    const result = await handleVendorImageUploadRequest(request);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("POST /api/register/vendor-upload-image:", e);
    const message = e instanceof Error ? e.message : "فشل رفع الصورة";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
