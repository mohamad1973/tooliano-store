import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  APPROVAL_STATUS,
  CAMPAIGN_OUTCOME,
  ORDER_STATUS,
} from "@/lib/db/constants";
import { issueDeliveryCodeForOrder } from "@/lib/campaign/issue-codes";
import { unlockOrderDeposit } from "@/lib/wallet/ledger";

export async function syncCampaigns(): Promise<{
  succeeded: number;
  failed: number;
}> {
  const now = new Date();
  let succeeded = 0;
  let failed = 0;

  const ended = await prisma.productSubmission.findMany({
    where: {
      campaignOutcome: CAMPAIGN_OUTCOME.ACTIVE,
      campaignEndsAt: { lte: now },
      status: APPROVAL_STATUS.APPROVED,
      publishedOnStore: true,
    },
  });

  for (const sub of ended) {
    const target = sub.suggestedQuantity;
    const met = sub.reservedQuantity >= target;
    if (met) {
      await succeedCampaign(sub.id);
      succeeded++;
    } else {
      await failCampaign(sub.id);
      failed++;
    }
  }

  return { succeeded, failed };
}

export async function tryEarlyCampaignSuccess(submissionId: string): Promise<boolean> {
  const sub = await prisma.productSubmission.findUnique({
    where: { id: submissionId },
  });
  if (!sub || sub.campaignOutcome !== CAMPAIGN_OUTCOME.ACTIVE) return false;
  if (sub.reservedQuantity < sub.suggestedQuantity) return false;
  await succeedCampaign(submissionId);
  return true;
}

export async function succeedCampaign(submissionId: string) {
  const sub = await prisma.productSubmission.findUnique({
    where: { id: submissionId },
  });
  if (!sub || sub.campaignOutcome !== CAMPAIGN_OUTCOME.ACTIVE) return;

  const orders = await prisma.groupBuyOrder.findMany({
    where: {
      submissionId,
      status: {
        in: [ORDER_STATUS.PAID_LOCKED, ORDER_STATUS.CAMPAIGN_ACTIVE],
      },
    },
  });

  for (const order of orders) {
    await issueDeliveryCodeForOrder(order.id);
  }

  await prisma.productSubmission.update({
    where: { id: submissionId },
    data: { campaignOutcome: CAMPAIGN_OUTCOME.SUCCEEDED },
  });
}

export async function failCampaign(submissionId: string) {
  const orders = await prisma.groupBuyOrder.findMany({
    where: {
      submissionId,
      status: {
        in: [
          ORDER_STATUS.PAID_LOCKED,
          ORDER_STATUS.CAMPAIGN_ACTIVE,
          ORDER_STATUS.READY_FOR_DELIVERY,
        ],
      },
    },
  });

  for (const order of orders) {
    if (
      order.status === ORDER_STATUS.PAID_LOCKED ||
      order.status === ORDER_STATUS.CAMPAIGN_ACTIVE
    ) {
      const unlockAmount =
        order.paidOnlineTotal > 0
          ? order.paidOnlineTotal
          : order.depositAmount;
      await unlockOrderDeposit({
        userId: order.buyerId,
        orderId: order.id,
        amount: unlockAmount,
        idempotencyKey: `unlock:${order.id}:campaign-failed`,
      });
    }
    await prisma.groupBuyOrder.update({
      where: { id: order.id },
      data: { status: ORDER_STATUS.CAMPAIGN_FAILED },
    });
  }

  await prisma.productSubmission.update({
    where: { id: submissionId },
    data: {
      campaignOutcome: CAMPAIGN_OUTCOME.FAILED,
      reservedQuantity: 0,
    },
  });
}
