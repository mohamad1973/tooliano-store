import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { buildCampaignProgress } from "@/lib/campaign/progress";
import { APPROVAL_STATUS, CAMPAIGN_OUTCOME } from "@/lib/db/constants";

type Params = { params: Promise<{ submissionId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { submissionId } = await params;

  const submission = await prisma.productSubmission.findFirst({
    where: {
      id: submissionId,
      status: APPROVAL_STATUS.APPROVED,
      publishedOnStore: true,
      adminHidden: false,
      campaignOutcome: CAMPAIGN_OUTCOME.ACTIVE,
    },
    select: {
      id: true,
      productName: true,
      suggestedQuantity: true,
      reservedQuantity: true,
      boostReservedQuantity: true,
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "الحملة غير موجودة" }, { status: 404 });
  }

  const progress = buildCampaignProgress({
    submissionId: submission.id,
    productName: submission.productName,
    suggestedQuantity: submission.suggestedQuantity,
    reservedQuantity: submission.reservedQuantity,
    boostReservedQuantity: submission.boostReservedQuantity,
  });

  return NextResponse.json(progress);
}
