import { DEFAULT_DEPOSIT_PERCENT } from "@/lib/db/constants";

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function calculateOrderAmounts(input: {
  unitGroupPrice: number;
  quantity: number;
  depositPercent?: number;
}): {
  lineTotal: number;
  depositAmount: number;
  codAmount: number;
  depositPercent: number;
} {
  const depositPercent = input.depositPercent ?? DEFAULT_DEPOSIT_PERCENT;
  const lineTotal = roundMoney(input.unitGroupPrice * input.quantity);
  const depositAmount = roundMoney(lineTotal * (depositPercent / 100));
  const codAmount = roundMoney(lineTotal - depositAmount);
  return { lineTotal, depositAmount, codAmount, depositPercent };
}
