import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { USER_ROLES } from "@/lib/db/constants";
import { ensureSubmissionImageOnWordPress } from "@/lib/submission-image-persist";

/** رفع صور المحلية إلى WordPress وتحديث قاعدة البيانات (أدمن فقط). */
export async function POST() {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const rows = await prisma.productSubmission.findMany({
    where: {
      productImageUrl: { not: null },
      status: "APPROVED",
    },
    select: {
      id: true,
      productName: true,
      productImageUrl: true,
      wooProductId: true,
    },
  });

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const url = await ensureSubmissionImageOnWordPress(row);
      if (url?.startsWith("http")) ok++;
      else skipped++;
    } catch (e) {
      console.error("[persist-images]", row.id, e);
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    total: rows.length,
    persisted: ok,
    skipped,
    failed,
  });
}
