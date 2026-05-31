import "server-only";

import type { ProductSubmission } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS } from "@/lib/db/constants";

export type SetSubmissionHiddenResult =
  | { ok: true; submission: ProductSubmission }
  | { ok: false; error: string };

export async function setSubmissionAdminHidden(
  submissionId: string,
  hidden: boolean,
): Promise<SetSubmissionHiddenResult> {
  const existing = await prisma.productSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!existing) {
    return { ok: false, error: "المنتج غير موجود" };
  }

  const publishedOnStore =
    !hidden && existing.status === APPROVAL_STATUS.APPROVED;

  const submission = await prisma.productSubmission.update({
    where: { id: submissionId },
    data: {
      adminHidden: hidden,
      publishedOnStore,
    },
  });

  return { ok: true, submission };
}
