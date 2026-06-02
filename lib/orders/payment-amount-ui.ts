import { roundMoney } from "@/lib/orders/pricing";

export type PaymentBoundsInput = {
  lineTotal: number;
  paidOnlineTotal: number;
  minDepositAmount: number;
  isFirstPayment: boolean;
};

export function getPaymentBounds(input: PaymentBoundsInput) {
  const remaining = roundMoney(
    Math.max(0, input.lineTotal - input.paidOnlineTotal),
  );
  const minDeposit = roundMoney(input.minDepositAmount);

  const min = input.isFirstPayment
    ? roundMoney(Math.min(minDeposit, remaining))
    : remaining <= 0.01
      ? 0
      : 0.01;

  const max = remaining;

  const defaultAmount = input.isFirstPayment
    ? min
    : max;

  return { min, max, remaining, defaultAmount };
}

export function validatePaymentAmountClient(
  input: PaymentBoundsInput & { amount: number },
): string | null {
  const { min, max, remaining } = getPaymentBounds(input);
  const amount = roundMoney(input.amount);

  if (amount <= 0) return "المبلغ يجب أن يكون أكبر من صفر";
  if (amount > max + 0.01) {
    return `المبلغ يتجاوز المتبقي (${remaining})`;
  }
  if (input.isFirstPayment && amount + 0.01 < min) {
    return `الحد الأدنى للدفعة الأولى ${min} (5% من قيمة الطلب)`;
  }
  return null;
}

export function previewAfterPayment(input: {
  lineTotal: number;
  paidOnlineTotal: number;
  amount: number;
}) {
  const paidAfter = roundMoney(input.paidOnlineTotal + input.amount);
  const remainingAfter = roundMoney(
    Math.max(0, input.lineTotal - paidAfter),
  );
  return { paidAfter, remainingAfter };
}
