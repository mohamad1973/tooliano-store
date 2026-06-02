import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  APPROVAL_STATUS,
  DEFAULT_CAMPAIGN_DAYS,
} from "@/lib/db/constants";
import {
  formatValidationIssues,
  validateSubmissionForApproval,
} from "@/lib/submission-validation";

export type ApproveSubmissionResult =
  | {
      ok: true;
      submission: Awaited<
        ReturnType<typeof prisma.productSubmission.update>
      >;
    }
  | { ok: false; error: string; validationIssues?: string };

/** موافقة على العرض في الموقع — بدون إنشاء WooCommerce */
export async function approveProductSubmission(
  submissionId: string,
  adminNote: string | null,
): Promise<ApproveSubmissionResult> {
  const submission = await prisma.productSubmission.findUnique({
    where: { id: submissionId },
    include: {
      vendor: { include: { vendorProfile: true } },
    },
  });

  if (!submission) {
    return { ok: false, error: "المنتج غير موجود" };
  }

  if (submission.status === APPROVAL_STATUS.APPROVED) {
    return { ok: false, error: "المنتج موافق عليه مسبقاً" };
  }

  const vendorApproved =
    submission.vendor.vendorProfile?.status === APPROVAL_STATUS.APPROVED;
  if (!vendorApproved) {
    return {
      ok: false,
      error: "يجب الموافقة على ملف التاجر أولاً قبل الموافقة على المنتج",
    };
  }

  const issues = validateSubmissionForApproval(submission);
  if (issues.length > 0) {
    return {
      ok: false,
      error: "البيانات غير مكتملة للموافقة",
      validationIssues: formatValidationIssues(issues),
    };
  }

  const campaignEndsAt = new Date();
  const durationMinutes =
    submission.dealDurationDays * 24 * 60 +
    submission.dealDurationHours * 60 +
    submission.dealDurationMinutes;
  if (Number.isFinite(durationMinutes) && durationMinutes > 0) {
    campaignEndsAt.setMinutes(campaignEndsAt.getMinutes() + durationMinutes);
  } else {
    campaignEndsAt.setDate(campaignEndsAt.getDate() + DEFAULT_CAMPAIGN_DAYS);
  }

  const vendorSettlement =
    submission.suggestedGroupPrice != null
      ? Math.round(submission.suggestedGroupPrice * 0.86 * 100) / 100
      : null;

  const updated = await prisma.productSubmission.update({
    where: { id: submissionId },
    data: {
      status: APPROVAL_STATUS.APPROVED,
      publishedOnStore: true,
      adminNote,
      reviewedAt: new Date(),
      campaignEndsAt,
      reservedQuantity: submission.reservedQuantity ?? 0,
      ...(vendorSettlement != null
        ? { vendorSettlementUnitPrice: vendorSettlement }
        : {}),
    },
  });

  return { ok: true, submission: updated };
}
