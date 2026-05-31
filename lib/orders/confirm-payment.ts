import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ORDER_STATUS } from "@/lib/db/constants";
import { depositAndLockForOrder } from "@/lib/wallet/ledger";
import {
  getOrderBalances,
  resolveLineTotal,
  validatePaymentAmount,
} from "@/lib/orders/order-balances";
import { roundMoney } from "@/lib/orders/pricing";

const PAYABLE_STATUSES = [
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PAID_LOCKED,
  ORDER_STATUS.CAMPAIGN_ACTIVE,
  ORDER_STATUS.READY_FOR_DELIVERY,
] as const;

export async function confirmOrderPayment(input: {
  orderId: string;
  amount: number;
  paymentRef: string;
  idempotencyKey: string;
  paymobOrderId?: string;
}) {
  const order = await prisma.groupBuyOrder.findUnique({
    where: { id: input.orderId },
    include: { submission: true, payments: true },
  });
  if (!order) throw new Error("الطلب غير موجود");

  const existingPayment = await prisma.orderPayment.findUnique({
    where: { paymentRef: input.paymentRef },
  });
  if (existingPayment) {
    if (existingPayment.orderId === order.id) return order;
    throw new Error("مرجع دفع مكرر");
  }

  const lineTotal = resolveLineTotal(order);
  const balances = getOrderBalances({
    lineTotal,
    paidOnlineTotal: order.paidOnlineTotal,
    minDepositAmount: order.minDepositAmount,
    unitGroupPrice: order.unitGroupPrice,
    quantity: order.quantity,
  });

  if (!PAYABLE_STATUSES.includes(order.status as (typeof PAYABLE_STATUSES)[number])) {
    if (balances.fullyPaidOnline) return order;
    throw new Error("حالة الطلب لا تسمح بالدفع");
  }

  const isFirstPayment = order.paidOnlineTotal <= 0.01;
  validatePaymentAmount({
    lineTotal: balances.lineTotal,
    paidOnlineTotal: balances.paidOnlineTotal,
    minDepositAmount: balances.minDepositAmount,
    amount: input.amount,
    isFirstPayment,
  });

  const amount = roundMoney(input.amount);
  const productName = order.submission.productName;

  await depositAndLockForOrder({
    userId: order.buyerId,
    orderId: order.id,
    amount,
    idempotencyKey: input.idempotencyKey,
    note: isFirstPayment
      ? `دفعة مقدمة — ${productName}`
      : `دفعة إضافية — ${productName}`,
    metadata: {
      productName,
      lineTotal: balances.lineTotal,
      paidAfter: roundMoney(balances.paidOnlineTotal + amount),
      remainingAfter: roundMoney(
        Math.max(0, balances.lineTotal - balances.paidOnlineTotal - amount),
      ),
    },
  });

  const newPaid = roundMoney(balances.paidOnlineTotal + amount);
  const newCod = roundMoney(Math.max(0, balances.lineTotal - newPaid));

  const updated = await prisma.$transaction(async (tx) => {
    await tx.orderPayment.create({
      data: {
        orderId: order.id,
        amount,
        paymentRef: input.paymentRef,
        idempotencyKey: input.idempotencyKey,
        paymobOrderId: input.paymobOrderId,
      },
    });

    const o = await tx.groupBuyOrder.update({
      where: { id: order.id },
      data: {
        paidOnlineTotal: newPaid,
        codAmount: newCod,
        depositAmount: isFirstPayment ? amount : order.depositAmount,
        status:
          order.status === ORDER_STATUS.PENDING_PAYMENT
            ? ORDER_STATUS.PAID_LOCKED
            : order.status,
        paymentRef: isFirstPayment ? input.paymentRef : order.paymentRef,
        paymobOrderId: input.paymobOrderId ?? order.paymobOrderId,
        idempotencyKey: isFirstPayment
          ? input.idempotencyKey
          : order.idempotencyKey,
      },
    });

    if (isFirstPayment) {
      await tx.productSubmission.update({
        where: { id: order.submissionId },
        data: { reservedQuantity: { increment: order.quantity } },
      });
    }

    return o;
  });

  if (isFirstPayment) {
    const { tryEarlyCampaignSuccess } = await import("@/lib/campaign/sync");
    await tryEarlyCampaignSuccess(order.submissionId);
  }

  return updated;
}
