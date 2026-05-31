import "server-only";

import { prisma } from "@/lib/db/prisma";
import { updateWooProductFromSubmission } from "@/lib/woo-update-product";
import { parseSubmissionProductBody } from "@/lib/submission-product-fields";
import { toSubmissionUpdateData } from "@/lib/submission-prisma-data";
import {
  formatValidationIssues,
  validateSubmissionForApproval,
} from "@/lib/submission-validation";
import { formatWooCommerceError } from "@/lib/woo-error-message";

export type AdminUpdateSubmissionResult =
  | {
      ok: true;
      submission: Awaited<ReturnType<typeof prisma.productSubmission.update>>;
      wooSynced: boolean;
    }
  | { ok: false; error: string; validationIssues?: string };

export async function adminUpdateSubmissionContent(
  submissionId: string,
  body: Record<string, unknown>,
  options?: { syncWoo?: boolean },
): Promise<AdminUpdateSubmissionResult> {
  const submission = await prisma.productSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    return { ok: false, error: "المنتج غير موجود" };
  }

  const input = parseSubmissionProductBody(body);
  const issues = validateSubmissionForApproval({
    ...submission,
    ...input,
  });
  if (issues.length > 0) {
    return {
      ok: false,
      error: "البيانات غير مكتملة",
      validationIssues: formatValidationIssues(issues),
    };
  }

  let updated = await prisma.productSubmission.update({
    where: { id: submissionId },
    data: toSubmissionUpdateData(input),
  });

  let wooSynced = false;
  if (options?.syncWoo && updated.wooProductId) {
    try {
      await updateWooProductFromSubmission(updated);
      updated = await prisma.productSubmission.findUniqueOrThrow({
        where: { id: submissionId },
      });
      wooSynced = true;
    } catch (e) {
      const message = formatWooCommerceError(e);
      return { ok: false, error: `تم حفظ البيانات محلياً لكن فشل تحديث WordPress: ${message}` };
    }
  }

  return { ok: true, submission: updated, wooSynced };
}
