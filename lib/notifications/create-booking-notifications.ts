import "server-only";

import { prisma } from "@/lib/db/prisma";
import { NOTIFICATION_TYPES, USER_ROLES } from "@/lib/db/constants";

export async function createBookingConfirmedNotifications(
  orderId: string,
): Promise<void> {
  const order = await prisma.groupBuyOrder.findUnique({
    where: { id: orderId },
    include: {
      submission: {
        select: { id: true, productName: true, vendorId: true },
      },
    },
  });
  if (!order) return;

  const { productName, id: submissionId, vendorId } = order.submission;

  const admins = await prisma.user.findMany({
    where: { role: USER_ROLES.ADMIN, disabled: false },
    select: { id: true },
  });

  const type = NOTIFICATION_TYPES.BOOKING_CONFIRMED;

  await prisma.appNotification.createMany({
    data: [
      {
        userId: order.buyerId,
        type,
        productName,
        message: `تم تأكيد حجزك على «${productName}»`,
        orderId,
        submissionId,
      },
      {
        userId: vendorId,
        type,
        productName,
        message: `حجز جديد مؤكّد على «${productName}»`,
        orderId,
        submissionId,
      },
      ...admins.map((admin) => ({
        userId: admin.id,
        type,
        productName,
        message: `حجز مؤكّد جديد — «${productName}»`,
        orderId,
        submissionId,
      })),
    ],
    skipDuplicates: true,
  });
}
