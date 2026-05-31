import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ORDER_STATUS } from "@/lib/db/constants";
import {
  deliveryCodeExpiresAt,
  generateDeliveryCode,
  hashDeliveryCode,
} from "@/lib/delivery/code";

export async function issueDeliveryCodeForOrder(orderId: string): Promise<string> {
  const code = generateDeliveryCode();
  const hash = hashDeliveryCode(code);

  await prisma.$transaction(async (tx) => {
    await tx.deliveryConfirmation.upsert({
      where: { orderId },
      create: {
        orderId,
        deliveryCodeHash: hash,
        codeExpiresAt: deliveryCodeExpiresAt(),
      },
      update: {
        deliveryCodeHash: hash,
        codeExpiresAt: deliveryCodeExpiresAt(),
        failedAttempts: 0,
        lockedAt: null,
      },
    });
    await tx.deliveryCodeReveal.upsert({
      where: { orderId },
      create: { orderId, plainCode: code },
      update: { plainCode: code, viewedAt: null },
    });
    await tx.groupBuyOrder.update({
      where: { id: orderId },
      data: { status: ORDER_STATUS.READY_FOR_DELIVERY },
    });
  });

  return code;
}
