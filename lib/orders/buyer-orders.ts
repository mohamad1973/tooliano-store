import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ORDER_STATUS } from "@/lib/db/constants";
import { ensureWallet } from "@/lib/wallet/ledger";

export async function getBuyerAccountSummary(userId: string) {
  const wallet = await ensureWallet(userId);
  const orders = await prisma.groupBuyOrder.findMany({
    where: { buyerId: userId },
    include: {
      submission: { select: { productName: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return { wallet, orders };
}

export async function getBuyerOrderDetail(userId: string, orderId: string) {
  const order = await prisma.groupBuyOrder.findFirst({
    where: { id: orderId, buyerId: userId },
    include: {
      submission: { select: { productName: true, id: true } },
      delivery: {
        include: { codeReveal: true },
      },
    },
  });
  if (!order) return null;

  let deliveryCode: string | null = null;
  if (
    order.status === ORDER_STATUS.READY_FOR_DELIVERY &&
    order.delivery?.codeReveal
  ) {
    deliveryCode = order.delivery.codeReveal.plainCode;
    if (!order.delivery.codeReveal.viewedAt) {
      await prisma.deliveryCodeReveal.update({
        where: { orderId: order.id },
        data: { viewedAt: new Date() },
      });
    }
  }

  return { order, deliveryCode };
}

export async function getWalletTransactions(userId: string, limit = 50) {
  const wallet = await ensureWallet(userId);
  return prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
