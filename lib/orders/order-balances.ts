import { roundMoney } from "@/lib/orders/pricing";

export type OrderBalanceInput = {
  lineTotal: number;
  paidOnlineTotal: number;
  minDepositAmount?: number;
  unitGroupPrice?: number;
  quantity?: number;
};

export function resolveLineTotal(order: OrderBalanceInput): number {
  if (order.lineTotal > 0) return roundMoney(order.lineTotal);
  if (order.unitGroupPrice != null && order.quantity != null) {
    return roundMoney(order.unitGroupPrice * order.quantity);
  }
  return 0;
}

export function getOrderBalances(order: OrderBalanceInput) {
  const lineTotal = resolveLineTotal(order);
  const paidOnlineTotal = roundMoney(order.paidOnlineTotal ?? 0);
  const remainingBalance = roundMoney(Math.max(0, lineTotal - paidOnlineTotal));
  const minDepositAmount =
    order.minDepositAmount != null && order.minDepositAmount > 0
      ? roundMoney(order.minDepositAmount)
      : roundMoney(lineTotal * 0.05);

  return {
    lineTotal,
    paidOnlineTotal,
    remainingBalance,
    minDepositAmount,
    codAtDelivery: remainingBalance,
    fullyPaidOnline: remainingBalance <= 0.01 && paidOnlineTotal > 0,
  };
}

export function validatePaymentAmount(input: {
  lineTotal: number;
  paidOnlineTotal: number;
  minDepositAmount: number;
  amount: number;
  isFirstPayment: boolean;
}): void {
  const remaining = roundMoney(input.lineTotal - input.paidOnlineTotal);
  if (input.amount <= 0) throw new Error("المبلغ يجب أن يكون أكبر من صفر");
  if (input.amount > remaining + 0.01) {
    throw new Error("المبلغ يتجاوز المتبقي على الطلب");
  }
  if (input.isFirstPayment && input.amount + 0.01 < input.minDepositAmount) {
    throw new Error(
      `الحد الأدنى للدفعة الأولى ${input.minDepositAmount} ج.م (5% من قيمة الطلب)`,
    );
  }
}
