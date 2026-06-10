import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  NOTIFICATION_TYPES,
  ORDER_STATUS,
  USER_ROLES,
  type NotificationType,
} from "@/lib/db/constants";

type CampaignStatusNotificationType =
  | typeof NOTIFICATION_TYPES.CAMPAIGN_EXPIRED
  | typeof NOTIFICATION_TYPES.CAMPAIGN_EXTENDED
  | typeof NOTIFICATION_TYPES.CAMPAIGN_EXECUTED
  | typeof NOTIFICATION_TYPES.CAMPAIGN_CANCELLED;

function messagesForType(
  type: CampaignStatusNotificationType,
  productName: string,
): { vendor: string; admin: string; buyer: string } {
  switch (type) {
    case NOTIFICATION_TYPES.CAMPAIGN_EXPIRED:
      return {
        vendor: `انتهت مدة عرض «${productName}» — مطلوب قرار: تمديد أو تنفيذ أو إنهاء`,
        admin: `انتهت مدة عرض «${productName}» — مطلوب قرار من التاجر أو الإدارة`,
        buyer: `انتهت مدة عرض «${productName}» — في انتظار تمديد المدة من البائع`,
      };
    case NOTIFICATION_TYPES.CAMPAIGN_EXTENDED:
      return {
        vendor: `تم تمديد مدة عرض «${productName}»`,
        admin: `تم تمديد مدة عرض «${productName}»`,
        buyer: `تم تمديد مدة عرض «${productName}» — يمكنك متابعة الحجز`,
      };
    case NOTIFICATION_TYPES.CAMPAIGN_EXECUTED:
      return {
        vendor: `تم تنفيذ صفقة «${productName}» على حالتها الحالية`,
        admin: `تم تنفيذ صفقة «${productName}» على حالتها الحالية`,
        buyer: `تم تنفيذ صفقة «${productName}» — تابع حالة طلبك`,
      };
    case NOTIFICATION_TYPES.CAMPAIGN_CANCELLED:
      return {
        vendor: `أُنهيت صفقة «${productName}» دون تنفيذ`,
        admin: `أُنهيت صفقة «${productName}» دون تنفيذ`,
        buyer: `أُنهيت صفقة «${productName}» دون تنفيذ — تم فك المبلغ المحجوز`,
      };
  }
}

function buildOrderId(
  submissionId: string,
  type: NotificationType,
  suffix?: string,
): string {
  if (type === NOTIFICATION_TYPES.CAMPAIGN_EXPIRED) {
    return `campaign:${submissionId}`;
  }
  return `campaign:${submissionId}:${suffix ?? Date.now()}`;
}

export async function createCampaignStatusNotifications(
  submissionId: string,
  type: CampaignStatusNotificationType,
  options?: { orderIdSuffix?: string },
): Promise<void> {
  const submission = await prisma.productSubmission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      productName: true,
      vendorId: true,
    },
  });
  if (!submission) return;

  const [admins, paidOrders] = await Promise.all([
    prisma.user.findMany({
      where: { role: USER_ROLES.ADMIN, disabled: false },
      select: { id: true },
    }),
    prisma.groupBuyOrder.findMany({
      where: {
        submissionId,
        status: {
          notIn: [
            ORDER_STATUS.PENDING_PAYMENT,
            ORDER_STATUS.CANCELLED,
            ORDER_STATUS.CAMPAIGN_FAILED,
          ],
        },
      },
      select: { buyerId: true },
      distinct: ["buyerId"],
    }),
  ]);

  const productName = submission.productName;
  const messages = messagesForType(type, productName);
  const orderId = buildOrderId(submissionId, type, options?.orderIdSuffix);

  const rows: {
    userId: string;
    type: string;
    productName: string;
    message: string;
    orderId: string;
    submissionId: string;
  }[] = [
    {
      userId: submission.vendorId,
      type,
      productName,
      message: messages.vendor,
      orderId,
      submissionId,
    },
    ...admins.map((admin) => ({
      userId: admin.id,
      type,
      productName,
      message: messages.admin,
      orderId,
      submissionId,
    })),
    ...paidOrders.map((order) => ({
      userId: order.buyerId,
      type,
      productName,
      message: messages.buyer,
      orderId,
      submissionId,
    })),
  ];

  if (rows.length === 0) return;

  await prisma.appNotification.createMany({
    data: rows,
    skipDuplicates: true,
  });
}
