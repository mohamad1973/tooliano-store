import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  calculateAffiliateCommission,
  maskUsername,
} from "@/lib/affiliate/commission";
import { creditAffiliateCommission } from "@/lib/wallet/ledger";

export async function payAffiliateCommissionForOrder(orderId: string) {
  const order = await prisma.groupBuyOrder.findUnique({
    where: { id: orderId },
    include: {
      submission: { select: { productName: true, affiliateCommissionPercent: true } },
      buyer: { select: { username: true } },
    },
  });

  if (!order?.referrerUserId || order.affiliateCommissionPaidAt) return null;
  if (order.submission.affiliateCommissionPercent <= 0) return null;

  const amount = calculateAffiliateCommission(
    order.lineTotal,
    order.submission.affiliateCommissionPercent,
  );
  if (amount <= 0) return null;

  const productName = order.submission.productName;

  await creditAffiliateCommission({
    userId: order.referrerUserId,
    orderId: order.id,
    amount,
    idempotencyKey: `affiliate:commission:${order.id}`,
    note: `عمولة إحالة — حجز «${productName}»`,
    metadata: {
      productName,
      lineTotal: order.lineTotal,
      percent: order.submission.affiliateCommissionPercent,
      referredBuyer: maskUsername(order.buyer.username),
      commissionAmount: amount,
    },
  });

  await prisma.groupBuyOrder.update({
    where: { id: order.id },
    data: {
      affiliateCommissionAmount: amount,
      affiliateCommissionPaidAt: new Date(),
    },
  });

  return amount;
}
