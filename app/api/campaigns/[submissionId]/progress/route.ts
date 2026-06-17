import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { buildCampaignProgress } from "@/lib/campaign/progress";
import { prepareApprovedSubmissionsForListing } from "@/lib/campaign/prepare-listing";
import {
  canReserveCampaign,
  resolveCampaignDisplayStatus,
} from "@/lib/campaign/status";
import { APPROVAL_STATUS } from "@/lib/db/constants";

type Params = { params: Promise<{ submissionId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { submissionId } = await params;

  try {
    await prepareApprovedSubmissionsForListing(submissionId);
  } catch (err) {
    console.error("[campaigns/progress] extend:", err);
  }

  const submission = await prisma.productSubmission.findFirst({
    where: {
      id: submissionId,
      status: APPROVAL_STATUS.APPROVED,
      publishedOnStore: true,
      adminHidden: false,
    },
    select: {
      id: true,
      productName: true,
      suggestedQuantity: true,
      reservedQuantity: true,
      boostReservedQuantity: true,
      campaignOutcome: true,
      campaignEndsAt: true,
      adminHidden: true,
    },
  });

  if (!submission || !submission.campaignEndsAt) {
    return NextResponse.json({ error: "الحملة غير موجودة" }, { status: 404 });
  }

  const displayStatus = resolveCampaignDisplayStatus(
    submission.campaignOutcome,
    submission.campaignEndsAt,
  );

  const progress = buildCampaignProgress({
    submissionId: submission.id,
    productName: submission.productName,
    suggestedQuantity: submission.suggestedQuantity,
    reservedQuantity: submission.reservedQuantity,
    boostReservedQuantity: submission.boostReservedQuantity,
  });

  return NextResponse.json({
    ...progress,
    displayStatus,
    canReserve: canReserveCampaign({
      campaignOutcome: submission.campaignOutcome,
      campaignEndsAt: submission.campaignEndsAt,
      adminHidden: submission.adminHidden,
    }),
  });
}
