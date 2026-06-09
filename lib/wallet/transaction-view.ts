import "server-only";

import type { WalletTransaction } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type EnrichedWalletTx = WalletTransaction & {
  productName?: string;
  orderStatus?: string;
  parsedMeta?: Record<string, unknown>;
};

export async function enrichWalletTransactions(
  transactions: WalletTransaction[],
): Promise<EnrichedWalletTx[]> {
  const orderIds = transactions
    .filter(
      (t) =>
        (t.referenceType === "order" || t.referenceType === "affiliate_order") &&
        t.referenceId,
    )
    .map((t) => t.referenceId as string);

  const orders =
    orderIds.length > 0
      ? await prisma.groupBuyOrder.findMany({
          where: { id: { in: orderIds } },
          include: { submission: { select: { productName: true } } },
        })
      : [];

  const orderMap = new Map(orders.map((o) => [o.id, o]));

  return transactions.map((t) => {
    let parsedMeta: Record<string, unknown> | undefined;
    if (t.metadata) {
      try {
        parsedMeta = JSON.parse(t.metadata) as Record<string, unknown>;
      } catch {
        parsedMeta = undefined;
      }
    }
    const order =
      (t.referenceType === "order" || t.referenceType === "affiliate_order") &&
      t.referenceId
        ? orderMap.get(t.referenceId)
        : undefined;
    return {
      ...t,
      productName:
        (parsedMeta?.productName as string) ?? order?.submission.productName,
      orderStatus: order?.status,
      parsedMeta,
    };
  });
}
