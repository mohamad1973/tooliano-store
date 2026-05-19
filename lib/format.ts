import { CURRENCY_LOCALE, DEFAULT_CURRENCY } from "@/lib/constants";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}
