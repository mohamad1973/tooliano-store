import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  APPROVAL_STATUS,
  CAMPAIGN_OUTCOME,
  NOTIFICATION_TYPES,
  ORDER_STATUS,
} from "@/lib/db/constants";
import { issueDeliveryCodeForOrder } from "@/lib/campaign/issue-codes";
import { unlockOrderDeposit } from "@/lib/wallet/ledger";
import { reverseAffiliateCommissionForOrder } from "@/lib/affiliate/reverse-commission";
import { createCampaignStatusNotifications } from "@/lib/notifications/create-campaign-status-notifications";

const DECISION_ELIGIBLE_OUTCOMES = new Set<string>([
  CAMPAIGN_OUTCOME.ACTIVE,
  CAMPAIGN_OUTCOME.AWAITING_DECISION,
]);

export async function syncCampaigns(): Promise<{
  succeeded: number;
  awaiting: number;
}> {
  const now = new Date();
  let succeeded = 0;
  let awaiting = 0;

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
      await createCampaignStatusNotifications(
        sub.id,
        NOTIFICATION_TYPES.CAMPAIGN_EXECUTED,
        { orderIdSuffix: `auto:${Date.now()}` },
      );
      succeeded++;
    } else {
      await markCampaignAwaitingDecision(sub.id);
      awaiting++;
    }
  }

  return { succeeded, awaiting };
}

export async function markCampaignAwaitingDecision(
  submissionId: string,
  options?: { notify?: boolean },
): Promise<void> {
  const sub = await prisma.productSubmission.findUnique({
    where: { id: submissionId },
  });
  if (!sub || sub.campaignOutcome !== CAMPAIGN_OUTCOME.ACTIVE) return;

  await prisma.productSubmission.update({
    where: { id: submissionId },
    data: { campaignOutcome: CAMPAIGN_OUTCOME.AWAITING_DECISION },
  });

  if (options?.notify !== false) {
    await createCampaignStatusNotifications(
      submissionId,
      NOTIFICATION_TYPES.CAMPAIGN_EXPIRED,
    );
  }
}

export async function tryEarlyCampaignSuccess(
  submissionId: string,
): Promise<boolean> {
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
  if (!sub || !DECISION_ELIGIBLE_OUTCOMES.has(sub.campaignOutcome)) return;

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
  const sub = await prisma.productSubmission.findUnique({
    where: { id: submissionId },
  });
  if (!sub || !DECISION_ELIGIBLE_OUTCOMES.has(sub.campaignOutcome)) return;

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
    await reverseAffiliateCommissionForOrder(order.id);
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
