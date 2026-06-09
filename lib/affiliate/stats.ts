import "server-only";

import { prisma } from "@/lib/db/prisma";
import { WALLET_TX_TYPES } from "@/lib/db/constants";
import { ensureBuyerReferralCode } from "@/lib/affiliate/referral-code";

export async function getAffiliateSummaryForBuyer(userId: string) {
  const referralCode = await ensureBuyerReferralCode(userId);
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { id: true },
  });

  const [commissionAgg, reversalAgg, recentTransactions, referredOrdersCount] =
    await Promise.all([
      wallet
        ? prisma.walletTransaction.aggregate({
            where: {
              walletId: wallet.id,
              type: WALLET_TX_TYPES.AFFILIATE_COMMISSION,
            },
            _sum: { amount: true },
          })
        : Promise.resolve({ _sum: { amount: 0 } }),
      wallet
        ? prisma.walletTransaction.aggregate({
            where: {
              walletId: wallet.id,
              type: WALLET_TX_TYPES.AFFILIATE_REVERSAL,
            },
            _sum: { amount: true },
          })
        : Promise.resolve({ _sum: { amount: 0 } }),
      wallet
        ? prisma.walletTransaction.findMany({
            where: {
              walletId: wallet.id,
              type: {
                in: [
                  WALLET_TX_TYPES.AFFILIATE_COMMISSION,
                  WALLET_TX_TYPES.AFFILIATE_REVERSAL,
                ],
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          })
        : Promise.resolve([]),
      prisma.groupBuyOrder.count({
        where: { referrerUserId: userId },
      }),
    ]);

  const totalEarned = commissionAgg._sum.amount ?? 0;
  const totalReversed = reversalAgg._sum.amount ?? 0;

  return {
    referralCode,
    totalEarned,
    totalReversed,
    netEarned: totalEarned - totalReversed,
    referredOrdersCount,
    recentTransactions,
  };
}
