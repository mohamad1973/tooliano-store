import "server-only";

import { roundMoney } from "@/lib/orders/pricing";

export function calculateAffiliateCommission(
  lineTotal: number,
  percent: number,
): number {
  if (percent <= 0 || lineTotal <= 0) return 0;
  const clamped = Math.min(100, Math.max(0, percent));
  return roundMoney((lineTotal * clamped) / 100);
}

export function parseAffiliateCommissionPercent(
  value: unknown,
): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number.parseFloat(String(value));
  if (!Number.isFinite(n)) return undefined;
  return Math.min(100, Math.max(0, roundMoney(n)));
}

export function maskUsername(username: string): string {
  if (username.length <= 2) return "**";
  return `${username.slice(0, 2)}***`;
}
