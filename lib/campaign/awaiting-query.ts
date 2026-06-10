import { APPROVAL_STATUS, CAMPAIGN_OUTCOME } from "@/lib/db/constants";
import type { Prisma } from "@prisma/client";

export function awaitingDecisionWhere(): Prisma.ProductSubmissionWhereInput {
  const now = new Date();
  return {
    status: APPROVAL_STATUS.APPROVED,
    publishedOnStore: true,
    adminHidden: false,
    OR: [
      { campaignOutcome: CAMPAIGN_OUTCOME.AWAITING_DECISION },
      {
        campaignOutcome: CAMPAIGN_OUTCOME.ACTIVE,
        campaignEndsAt: { lte: now },
      },
    ],
  };
}
