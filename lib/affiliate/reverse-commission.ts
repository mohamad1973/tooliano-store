import "server-only";

import { prisma } from "@/lib/db/prisma";
import { reverseAffiliateCommission } from "@/lib/wallet/ledger";

export async function reverseAffiliateCommissionForOrder(orderId: string) {
  const order = await prisma.groupBuyOrder.findUnique({
    where: { id: orderId },
    include: {
      submission: { select: { productName: true, affiliateCommissionPercent: true } },
    },
  });

  if (
    !order?.referrerUserId ||
    !order.affiliateCommissionPaidAt ||
    !order.affiliateCommissionAmount ||
    order.affiliateCommissionAmount <= 0
  ) {
    return null;
  }

  const productName = order.submission.productName;
  const amount = order.affiliateCommissionAmount;

  await reverseAffiliateCommission({
    userId: order.referrerUserId,
    orderId: order.id,
    amount,
    idempotencyKey: `affiliate:reversal:${order.id}`,
    note: `خصم عمولة — فشل صفقة «${productName}»`,
    metadata: {
      productName,
      lineTotal: order.lineTotal,
      percent: order.submission.affiliateCommissionPercent,
      commissionAmount: amount,
    },
  });

  return amount;
}
