import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  DELIVERY_CODE_MAX_ATTEMPTS,
  ORDER_STATUS,
} from "@/lib/db/constants";
import { verifyDeliveryCode } from "@/lib/delivery/code";
import { settleOrderToPlatform } from "@/lib/wallet/ledger";

export type ConfirmDeliveryResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string; locked?: boolean };

export async function confirmDeliveryByCode(input: {
  agentId: string;
  code: string;
  codCollected?: boolean;
}): Promise<ConfirmDeliveryResult> {
  const normalized = input.code.replace(/\D/g, "");
  if (normalized.length !== 6) {
    return { ok: false, error: "الكود يجب أن يكون 6 أرقام" };
  }

  const deliveries = await prisma.deliveryConfirmation.findMany({
    where: {
      confirmedAt: null,
      lockedAt: null,
      codeExpiresAt: { gt: new Date() },
      order: { status: ORDER_STATUS.READY_FOR_DELIVERY },
    },
    include: { order: true },
    take: 500,
  });

  const match = deliveries.find((d) =>
    verifyDeliveryCode(normalized, d.deliveryCodeHash),
  );

  if (!match) {
    return { ok: false, error: "كود غير صحيح أو منتهي" };
  }

  const delivery = await prisma.deliveryConfirmation.findUnique({
    where: { id: match.id },
    include: { order: true },
  });
  if (!delivery || delivery.confirmedAt) {
    return { ok: false, error: "تم تأكيد هذا الطلب مسبقاً" };
  }
  if (delivery.lockedAt) {
    return { ok: false, error: "الطلب مقفول", locked: true };
  }
  if (delivery.codeExpiresAt < new Date()) {
    return { ok: false, error: "انتهت صلاحية الكود" };
  }
  if (delivery.order.status !== ORDER_STATUS.READY_FOR_DELIVERY) {
    return { ok: false, error: "حالة الطلب غير مناسبة" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.deliveryConfirmation.update({
      where: { id: delivery.id },
      data: {
        confirmedAt: new Date(),
        confirmedByAgentId: input.agentId,
        codCollected: input.codCollected ?? true,
      },
    });
    await tx.groupBuyOrder.update({
      where: { id: delivery.orderId },
      data: { status: ORDER_STATUS.DELIVERED },
    });
  });

  const settleAmount =
    delivery.order.paidOnlineTotal > 0
      ? delivery.order.paidOnlineTotal
      : delivery.order.depositAmount;

  await settleOrderToPlatform({
    userId: delivery.order.buyerId,
    orderId: delivery.orderId,
    amount: settleAmount,
    idempotencyKey: `settle:${delivery.orderId}`,
    note: "تسوية المبالغ المحجوزة بعد التسليم",
  });

  return { ok: true, orderId: delivery.orderId };
}

export async function recordFailedDeliveryAttempt(code: string): Promise<void> {
  const normalized = code.replace(/\D/g, "");
  if (normalized.length !== 6) return;

  const deliveries = await prisma.deliveryConfirmation.findMany({
    where: {
      confirmedAt: null,
      lockedAt: null,
      order: { status: ORDER_STATUS.READY_FOR_DELIVERY },
    },
    take: 500,
  });

  for (const d of deliveries) {
    if (!verifyDeliveryCode(normalized, d.deliveryCodeHash)) continue;
    const attempts = d.failedAttempts + 1;
    await prisma.deliveryConfirmation.update({
      where: { id: d.id },
      data: {
        failedAttempts: attempts,
        ...(attempts >= DELIVERY_CODE_MAX_ATTEMPTS
          ? { lockedAt: new Date() }
          : {}),
      },
    });
    break;
  }
}
