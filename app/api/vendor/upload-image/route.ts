import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/db/constants";
import { handleVendorImageUploadRequest } from "@/lib/handle-vendor-image-upload-request";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.VENDOR) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const result = await handleVendorImageUploadRequest(request);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("POST /api/vendor/upload-image:", e);
    const message = e instanceof Error ? e.message : "فشل رفع الصورة";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
