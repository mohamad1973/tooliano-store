import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  APPROVAL_STATUS,
  CAMPAIGN_OUTCOME,
  NOTIFICATION_TYPES,
} from "@/lib/db/constants";
import { succeedCampaign } from "@/lib/campaign/campaign-outcome";
import { repairApprovedStoreVisibility } from "@/lib/campaign/ensure-visibility";
import { createCampaignStatusNotifications } from "@/lib/notifications/create-campaign-status-notifications";

const AUTO_EXTEND_DAYS = 1;

const EXPIRED_OUTCOMES = [
  CAMPAIGN_OUTCOME.ACTIVE,
  CAMPAIGN_OUTCOME.AWAITING_DECISION,
] as const;

function expiredSubmissionWhere(now: Date, submissionId?: string) {
  return {
    ...(submissionId ? { id: submissionId } : {}),
    status: APPROVAL_STATUS.APPROVED,
    campaignOutcome: { in: [...EXPIRED_OUTCOMES] },
    campaignEndsAt: { lte: now },
  };
}

export async function autoExtendCampaignOneDay(
  submissionId: string,
  options?: { notify?: boolean },
): Promise<boolean> {
  const sub = await prisma.productSubmission.findUnique({
    where: { id: submissionId },
  });
  if (!sub || sub.status !== APPROVAL_STATUS.APPROVED) return false;

  const campaignEndsAt = new Date();
  campaignEndsAt.setDate(campaignEndsAt.getDate() + AUTO_EXTEND_DAYS);

  await prisma.productSubmission.update({
    where: { id: submissionId },
    data: {
      campaignEndsAt,
      campaignOutcome: CAMPAIGN_OUTCOME.ACTIVE,
      ...(!sub.adminHidden ? { publishedOnStore: true } : {}),
    },
  });

  if (options?.notify !== false) {
    await createCampaignStatusNotifications(
      submissionId,
      NOTIFICATION_TYPES.CAMPAIGN_EXTENDED,
      { orderIdSuffix: `auto:${Date.now()}` },
    );
  }

  return true;
}

async function processSubmissionExpiry(
  sub: {
    id: string;
    suggestedQuantity: number;
    reservedQuantity: number;
  },
  options?: { notify?: boolean },
): Promise<"extended" | "succeeded" | "skipped"> {
  const met = sub.reservedQuantity >= sub.suggestedQuantity;
  if (met) {
    await succeedCampaign(sub.id);
    if (options?.notify !== false) {
      await createCampaignStatusNotifications(
        sub.id,
        NOTIFICATION_TYPES.CAMPAIGN_EXECUTED,
        { orderIdSuffix: `auto:${Date.now()}` },
      );
    }
    return "succeeded";
  }

  await autoExtendCampaignOneDay(sub.id, options);
  return "extended";
}

export async function processExpiredCampaigns(options?: {
  notify?: boolean;
  submissionId?: string;
}): Promise<{ extended: number; succeeded: number }> {
  await repairApprovedStoreVisibility(options?.submissionId);

  const now = new Date();
  const ended = await prisma.productSubmission.findMany({
    where: expiredSubmissionWhere(now, options?.submissionId),
    select: {
      id: true,
      suggestedQuantity: true,
      reservedQuantity: true,
    },
  });

  let extended = 0;
  let succeeded = 0;

  for (const sub of ended) {
    try {
      const result = await processSubmissionExpiry(sub, options);
      if (result === "extended") extended++;
      else if (result === "succeeded") succeeded++;
    } catch (err) {
      console.error(`[processExpiredCampaigns] ${sub.id}:`, err);
    }
  }

  return { extended, succeeded };
}

export async function ensureSubmissionCampaignExtended(
  submissionId: string,
): Promise<void> {
  await processExpiredCampaigns({ notify: false, submissionId });
}
