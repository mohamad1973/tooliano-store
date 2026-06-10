import "server-only";

import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS, ORDER_STATUS } from "@/lib/db/constants";
import { canReserveCampaign } from "@/lib/campaign/status";
import { calculateOrderAmounts } from "@/lib/orders/pricing";

export async function createGroupBuyOrder(input: {
  buyerId: string;
  submissionId: string;
  quantity: number;
  referrerUserId?: string | null;
}) {
  const row = await prisma.productSubmission.findUnique({
    where: { id: input.submissionId },
  });

  if (
    !row ||
    row.status !== APPROVAL_STATUS.APPROVED ||
    !row.publishedOnStore ||
    row.adminHidden ||
    !row.campaignEndsAt ||
    row.suggestedGroupPrice == null
  ) {
    throw new Error("العرض غير متاح للحجز");
  }

  if (
    !canReserveCampaign({
      campaignOutcome: row.campaignOutcome,
      campaignEndsAt: row.campaignEndsAt,
      adminHidden: row.adminHidden,
    })
  ) {
    throw new Error(
      "انتهت مدة العرض — في انتظار تمديد المدة من البائع ولا يمكن الحجز حالياً",
    );
  }

  if (input.quantity < 1) throw new Error("الكمية غير صالحة");
  if (row.reservedQuantity + input.quantity > row.suggestedQuantity) {
    throw new Error("الكمية تتجاوز المتبقي في الحملة");
  }

  const { lineTotal, depositAmount, depositPercent } = calculateOrderAmounts({
    unitGroupPrice: row.suggestedGroupPrice,
    quantity: input.quantity,
  });

  return prisma.groupBuyOrder.create({
    data: {
      buyerId: input.buyerId,
      submissionId: input.submissionId,
      quantity: input.quantity,
      unitGroupPrice: row.suggestedGroupPrice,
      lineTotal,
      minDepositAmount: depositAmount,
      paidOnlineTotal: 0,
      depositPercent,
      depositAmount,
      codAmount: lineTotal,
      status: ORDER_STATUS.PENDING_PAYMENT,
      referrerUserId: input.referrerUserId ?? null,
    },
  });
}
