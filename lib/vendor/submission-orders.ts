import "server-only";

import { prisma } from "@/lib/db/prisma";

/** ملخص طلبات الحملة للتاجر — بدون مبالغ مالية */
export async function getVendorOrderSummaries(vendorId: string) {
  const submissions = await prisma.productSubmission.findMany({
    where: { vendorId, status: "APPROVED", publishedOnStore: true },
    select: {
      id: true,
      productName: true,
      reservedQuantity: true,
      suggestedQuantity: true,
      campaignOutcome: true,
      groupBuyOrders: {
        select: {
          id: true,
          quantity: true,
          status: true,
        },
      },
    },
  });

  return submissions.map((s) => ({
    id: s.id,
    productName: s.productName,
    reservedQuantity: s.reservedQuantity,
    targetQuantity: s.suggestedQuantity,
    campaignOutcome: s.campaignOutcome,
    orders: s.groupBuyOrders.map((o) => ({
      id: o.id,
      quantity: o.quantity,
      status: o.status,
    })),
  }));
}
