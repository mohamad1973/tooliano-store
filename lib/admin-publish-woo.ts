import "server-only";

import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS, WOO_SYNC_STATUS } from "@/lib/db/constants";
import { syncSubmissionImageFromWooProduct } from "@/lib/submission-image-persist";
import { createWooProductFromSubmission } from "@/lib/woo-create-product";
import { formatWooCommerceError } from "@/lib/woo-error-message";
import {
  formatValidationIssues,
  validateSubmissionForApproval,
} from "@/lib/submission-validation";

export type PublishWooResult =
  | {
      ok: true;
      wooProductId: number;
      submission: Awaited<ReturnType<typeof prisma.productSubmission.update>>;
    }
  | { ok: false; error: string; validationIssues?: string };

export async function publishSubmissionToWooCommerce(
  submissionId: string,
): Promise<PublishWooResult> {
  const submission = await prisma.productSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    return { ok: false, error: "المنتج غير موجود" };
  }

  if (submission.status !== APPROVAL_STATUS.APPROVED) {
    return {
      ok: false,
      error: "يجب الموافقة على المنتج أولاً قبل النشر على WordPress",
    };
  }

  if (submission.wooProductId) {
    return {
      ok: false,
      error: `المنتج منشور مسبقاً على WordPress (#${submission.wooProductId})`,
    };
  }

  const issues = validateSubmissionForApproval(submission);
  if (issues.length > 0) {
    return {
      ok: false,
      error: "البيانات غير مكتملة للنشر",
      validationIssues: formatValidationIssues(issues),
    };
  }

  try {
    const created = await createWooProductFromSubmission(submission);
    let updated = await prisma.productSubmission.update({
      where: { id: submissionId },
      data: {
        wooProductId: created.wooProductId,
        wooSyncStatus: WOO_SYNC_STATUS.SYNCED,
        wooSyncError: null,
      },
    });

    try {
      await syncSubmissionImageFromWooProduct(
        submissionId,
        created.wooProductId,
      );
      updated = await prisma.productSubmission.findUniqueOrThrow({
        where: { id: submissionId },
      });
    } catch (e) {
      console.error("[publishSubmissionToWooCommerce] image sync:", e);
    }

    return {
      ok: true,
      wooProductId: created.wooProductId,
      submission: updated,
    };
  } catch (e) {
    console.error("WooCommerce publish failed:", e);
    const message = formatWooCommerceError(e);
    await prisma.productSubmission.update({
      where: { id: submissionId },
      data: {
        wooSyncStatus: WOO_SYNC_STATUS.FAILED,
        wooSyncError: message,
      },
    });
    return { ok: false, error: message };
  }
}
