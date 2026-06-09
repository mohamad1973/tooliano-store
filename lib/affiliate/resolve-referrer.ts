import "server-only";

import { prisma } from "@/lib/db/prisma";
import { findReferrerByCode } from "@/lib/affiliate/referral-code";

export async function resolveReferrerForOrder(input: {
  referralCode: string | null | undefined;
  buyerId: string;
  submissionId: string;
}): Promise<string | null> {
  const referrer = await findReferrerByCode(input.referralCode);
  if (!referrer) return null;
  if (referrer.id === input.buyerId) return null;

  const submission = await prisma.productSubmission.findUnique({
    where: { id: input.submissionId },
    select: { affiliateCommissionPercent: true },
  });
  if (!submission || submission.affiliateCommissionPercent <= 0) {
    return null;
  }

  return referrer.id;
}
