import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  APPROVAL_STATUS,
  CAMPAIGN_OUTCOME,
  DEFAULT_CAMPAIGN_DAYS,
} from "@/lib/db/constants";

function computeCampaignEndsAt(row: {
  dealDurationDays: number;
  dealDurationHours: number;
  dealDurationMinutes: number;
}): Date {
  const campaignEndsAt = new Date();
  const durationMinutes =
    row.dealDurationDays * 24 * 60 +
    row.dealDurationHours * 60 +
    row.dealDurationMinutes;
  if (Number.isFinite(durationMinutes) && durationMinutes > 0) {
    campaignEndsAt.setMinutes(campaignEndsAt.getMinutes() + durationMinutes);
  } else {
    campaignEndsAt.setDate(campaignEndsAt.getDate() + DEFAULT_CAMPAIGN_DAYS);
  }
  return campaignEndsAt;
}

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

/** يضبط campaignEndsAt للمعتمدة التي تفتقد تاريخ انتهاء */
export async function repairMissingCampaignEndsAt(
  submissionId?: string,
): Promise<number> {
  const rows = await prisma.productSubmission.findMany({
    where: {
      ...(submissionId ? { id: submissionId } : {}),
      status: APPROVAL_STATUS.APPROVED,
      adminHidden: false,
      campaignEndsAt: null,
    },
    select: {
      id: true,
      dealDurationDays: true,
      dealDurationHours: true,
      dealDurationMinutes: true,
    },
  });

  let repaired = 0;
  for (const row of rows) {
    await prisma.productSubmission.update({
      where: { id: row.id },
      data: {
        campaignEndsAt: computeCampaignEndsAt(row),
        campaignOutcome: CAMPAIGN_OUTCOME.ACTIVE,
        publishedOnStore: true,
      },
    });
    repaired++;
  }
  return repaired;
}
