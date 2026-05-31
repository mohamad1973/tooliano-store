import "server-only";

import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS, ORDER_STATUS, USER_ROLES } from "@/lib/db/constants";

export async function getAdminOverviewStats() {
  const [
    adminCount,
    vendorCount,
    buyerCount,
    agentCount,
    pendingVendors,
    pendingProducts,
    paidOrders,
    platformTotal,
    onlinePaidSum,
  ] = await Promise.all([
    prisma.user.count({ where: { role: USER_ROLES.ADMIN } }),
    prisma.user.count({ where: { role: USER_ROLES.VENDOR } }),
    prisma.user.count({ where: { role: USER_ROLES.BUYER } }),
    prisma.user.count({ where: { role: USER_ROLES.DELIVERY_AGENT } }),
    prisma.vendorProfile.count({ where: { status: APPROVAL_STATUS.PENDING } }),
    prisma.productSubmission.count({
      where: { status: APPROVAL_STATUS.PENDING },
    }),
    prisma.groupBuyOrder.count({
      where: {
        status: {
          notIn: [ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.CANCELLED],
        },
      },
    }),
    prisma.platformLedgerEntry.aggregate({ _sum: { amount: true } }),
    prisma.groupBuyOrder.aggregate({ _sum: { paidOnlineTotal: true } }),
  ]);

  return {
    adminCount,
    vendorCount,
    buyerCount,
    agentCount,
    pendingVendors,
    pendingProducts,
    paidOrders,
    platformSettled: platformTotal._sum.amount ?? 0,
    totalPaidOnline: onlinePaidSum._sum.paidOnlineTotal ?? 0,
  };
}
