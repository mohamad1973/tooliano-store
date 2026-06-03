import "server-only";

import { prisma } from "@/lib/db/prisma";
import { NOTIFICATION_TYPES, ORDER_STATUS } from "@/lib/db/constants";
import { buildCampaignProgress } from "@/lib/campaign/progress";

const PAID_STATUSES = [
  ORDER_STATUS.PAID_LOCKED,
  ORDER_STATUS.CAMPAIGN_ACTIVE,
  ORDER_STATUS.READY_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
] as const;

export async function createCampaignRemainingNotifications(
  triggerOrderId: string,
): Promise<void> {
  const order = await prisma.groupBuyOrder.findUnique({
    where: { id: triggerOrderId },
    include: {
      submission: {
        select: {
          id: true,
          productName: true,
          suggestedQuantity: true,
          reservedQuantity: true,
          boostReservedQuantity: true,
        },
      },
    },
  });
  if (!order) return;

  const progress = buildCampaignProgress({
    submissionId: order.submission.id,
    productName: order.submission.productName,
    suggestedQuantity: order.submission.suggestedQuantity,
    reservedQuantity: order.submission.reservedQuantity,
    boostReservedQuantity: order.submission.boostReservedQuantity,
  });

  const otherBuyers = await prisma.groupBuyOrder.findMany({
    where: {
      submissionId: order.submissionId,
      buyerId: { not: order.buyerId },
      status: { in: [...PAID_STATUSES] },
    },
    select: { buyerId: true },
    distinct: ["buyerId"],
  });

  if (otherBuyers.length === 0) return;

  const buyerIds = otherBuyers.map((o) => o.buyerId);
  const prefs = await prisma.userNotificationPreference.findMany({
    where: { userId: { in: buyerIds } },
  });
  const disabled = new Set(
    prefs.filter((p) => !p.enabled).map((p) => p.userId),
  );
  const recipients = buyerIds.filter((id) => !disabled.has(id));
  if (recipients.length === 0) return;

  const type = NOTIFICATION_TYPES.CAMPAIGN_REMAINING;
  const message = `بقي ${progress.remaining} قطعة لإكمال حملة «${progress.productName}»`;

  await prisma.appNotification.createMany({
    data: recipients.map((userId) => ({
      userId,
      type,
      productName: progress.productName,
      message,
      orderId: triggerOrderId,
      submissionId: order.submissionId,
      remainingQuantity: progress.remaining,
    })),
    skipDuplicates: true,
  });
}
