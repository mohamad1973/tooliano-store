import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ORDER_STATUS } from "@/lib/db/constants";
import { getOrderBalances } from "@/lib/orders/order-balances";

export async function getFinanceSummary() {
  const [orders, platformTotal, payments] = await Promise.all([
    prisma.groupBuyOrder.findMany({
      where: {
        status: { not: ORDER_STATUS.CANCELLED },
      },
      include: {
        submission: {
          select: {
            productName: true,
            suggestedGroupPrice: true,
            vendorSettlementUnitPrice: true,
          },
        },
        buyer: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.platformLedgerEntry.aggregate({ _sum: { amount: true } }),
    prisma.orderPayment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        order: {
          include: {
            submission: { select: { productName: true } },
            buyer: { select: { username: true } },
          },
        },
      },
    }),
  ]);

  let totalPaidOnline = 0;
  let totalMarginDelivered = 0;
  let totalVendorOwedDelivered = 0;

  const orderRows = orders.map((o) => {
    const b = getOrderBalances(o);
    totalPaidOnline += b.paidOnlineTotal;
    const settlement = o.submission.vendorSettlementUnitPrice ?? 0;
    const marginPerUnit = o.unitGroupPrice - settlement;
    if (o.status === ORDER_STATUS.DELIVERED && settlement > 0) {
      totalMarginDelivered += marginPerUnit * o.quantity;
      totalVendorOwedDelivered += settlement * o.quantity;
    }
    return {
      id: o.id,
      productName: o.submission.productName,
      buyerUsername: o.buyer.username,
      status: o.status,
      ...b,
      marginEstimate:
        settlement > 0 ? marginPerUnit * o.quantity : null,
    };
  });

  return {
    totalPaidOnline,
    platformSettled: platformTotal._sum.amount ?? 0,
    totalMarginDelivered,
    totalVendorOwedDelivered,
    orderRows,
    payments,
  };
}
