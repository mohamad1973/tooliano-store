import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/db/constants";
import { uploadProductImageFromRequest } from "@/lib/upload-product-image-to-wp";

export async function POST(request: Request) {
  const session = await getSession();
  if (
    !session ||
    (session.role !== USER_ROLES.VENDOR && session.role !== USER_ROLES.ADMIN)
  ) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const result = await uploadProductImageFromRequest(request);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("POST /api/upload:", e);
    const message = e instanceof Error ? e.message : "فشل رفع الصورة";
    const status = message.includes("غير مصرح") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
