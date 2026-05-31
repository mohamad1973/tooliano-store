import { NextResponse } from "next/server";
import { handleVendorImageUploadRequest } from "@/lib/handle-vendor-image-upload-request";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { USER_ROLES } from "@/lib/db/constants";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const exists = await prisma.productSubmission.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  try {
    const result = await handleVendorImageUploadRequest(request);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("POST admin upload-image:", e);
    const message = e instanceof Error ? e.message : "فشل رفع الصورة";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
