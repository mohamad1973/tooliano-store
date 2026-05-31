import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ORDER_STATUS } from "@/lib/db/constants";

const BLOCKING_ORDER_STATUSES = [
  ORDER_STATUS.PAID_LOCKED,
  ORDER_STATUS.CAMPAIGN_ACTIVE,
  ORDER_STATUS.READY_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
] as const;

export type DeleteSubmissionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function adminDeleteProductSubmission(
  submissionId: string,
): Promise<DeleteSubmissionResult> {
  const submission = await prisma.productSubmission.findUnique({
    where: { id: submissionId },
    include: {
      groupBuyOrders: {
        where: { status: { in: [...BLOCKING_ORDER_STATUSES] } },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!submission) {
    return { ok: false, error: "المنتج غير موجود" };
  }

  if (submission.groupBuyOrders.length > 0) {
    return {
      ok: false,
      error:
        "لا يمكن مسح منتج له طلبات مدفوعة أو قيد التنفيذ — ألغِ أو أنهِ الطلبات أولاً",
    };
  }

  await prisma.productSubmission.delete({ where: { id: submissionId } });
  return { ok: true };
}
