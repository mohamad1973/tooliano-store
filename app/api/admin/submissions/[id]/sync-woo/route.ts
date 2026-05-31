import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { USER_ROLES, WOO_SYNC_STATUS } from "@/lib/db/constants";
import { updateWooProductFromSubmission } from "@/lib/woo-update-product";
import { formatWooCommerceError } from "@/lib/woo-error-message";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const submission = await prisma.productSubmission.findUnique({
    where: { id },
  });

  if (!submission) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  if (!submission.wooProductId) {
    return NextResponse.json(
      { error: "المنتج غير منشور على WordPress — استخدم «نشر على WordPress» أولاً" },
      { status: 400 },
    );
  }

  try {
    const result = await updateWooProductFromSubmission(submission);
    const updated = await prisma.productSubmission.update({
      where: { id },
      data: {
        wooSyncStatus: WOO_SYNC_STATUS.SYNCED,
        wooSyncError: null,
      },
    });
    return NextResponse.json({
      ok: true,
      wooProductId: result.wooProductId,
      submission: updated,
    });
  } catch (e) {
    const message = formatWooCommerceError(e);
    await prisma.productSubmission.update({
      where: { id },
      data: {
        wooSyncStatus: WOO_SYNC_STATUS.FAILED,
        wooSyncError: message,
      },
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
