import "server-only";

import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS } from "@/lib/db/constants";

/** يضمن publishedOnStore=true لكل منتج معتمد غير مخفي إدارياً */
export async function repairApprovedStoreVisibility(
  submissionId?: string,
): Promise<number> {
  const result = await prisma.productSubmission.updateMany({
    where: {
      ...(submissionId ? { id: submissionId } : {}),
      status: APPROVAL_STATUS.APPROVED,
      adminHidden: false,
      publishedOnStore: false,
    },
    data: { publishedOnStore: true },
  });
  return result.count;
}
