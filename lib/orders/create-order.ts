import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ORDER_STATUS } from "@/lib/db/constants";
import { calculateOrderAmounts, roundMoney } from "@/lib/orders/pricing";
import { requireSubmissionCampaign } from "@/lib/submission-campaign";

export async function createGroupBuyOrder(input: {
  buyerId: string;
  submissionId: string;
  quantity: number;
  referrerUserId?: string | null;
}) {
  const campaign = await requireSubmissionCampaign(input.submissionId);
  if (input.quantity < 1) throw new Error("الكمية غير صالحة");
  if (campaign.reservedQuantity + input.quantity > campaign.targetQuantity) {
    throw new Error("الكمية تتجاوز المتبقي في الحملة");
  }

  const { lineTotal, depositAmount, depositPercent } = calculateOrderAmounts({
    unitGroupPrice: campaign.groupPrice,
    quantity: input.quantity,
  });

  return prisma.groupBuyOrder.create({
    data: {
      buyerId: input.buyerId,
      submissionId: input.submissionId,
      quantity: input.quantity,
      unitGroupPrice: campaign.groupPrice,
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
