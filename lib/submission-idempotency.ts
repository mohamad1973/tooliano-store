import "server-only";

import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS } from "@/lib/db/constants";

/** منع إرسال نفس المنتج أكثر من مرة خلال نافذة زمنية */
const DUPLICATE_WINDOW_MS = 60_000;

export async function findDuplicateSubmission(params: {
  vendorId: string;
  productName: string;
  idempotencyKey?: string | null;
}) {
  const { vendorId, productName, idempotencyKey } = params;
  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);

  if (idempotencyKey) {
    const byKey = await prisma.productSubmission.findFirst({
      where: { idempotencyKey },
    });
    if (byKey) return byKey;
  }

  return prisma.productSubmission.findFirst({
    where: {
      vendorId,
      productName: productName.trim(),
      status: {
        in: [
          APPROVAL_STATUS.PENDING,
          APPROVAL_STATUS.NEEDS_REVISION,
        ],
      },
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
  });
}
