import { WALLET_TX_TYPES } from "@/lib/db/constants";
import type { EnrichedWalletTx } from "@/lib/wallet/transaction-view";

export type WalletStatementLine = {
  id: string;
  date: Date;
  productName: string;
  orderId: string | null;
  kind: "deposit" | "unlock" | "settle" | "refund" | "other";
  title: string;
  description: string;
  amountPaid: number;
  orderTotal: number | null;
  paidOnOrder: number | null;
  remainingOnOrder: number | null;
};

function idempotencyBase(key: string | null | undefined): string | null {
  if (!key) return null;
  const idx = key.lastIndexOf(":");
  return idx > 0 ? key.slice(0, idx) : key;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  return null;
}

function depositTitle(note: string | null): string {
  if (note?.includes("دفعة مقدمة")) return "تم دفع مقدم حجز";
  if (note?.includes("دفعة إضافية")) return "تم دفع دفعة إضافية على الحجز";
  return "تم دفع على الحجز";
}

function buildDepositLine(deposit: EnrichedWalletTx): WalletStatementLine {
  const meta = deposit.parsedMeta;
  const productName =
    deposit.productName ?? (meta?.productName as string) ?? "طلب شراء جماعي";
  const orderTotal = num(meta?.lineTotal);
  const paidOnOrder = num(meta?.paidAfter);
  const remainingOnOrder = num(meta?.remainingAfter);
  const title = depositTitle(deposit.note);

  const parts = [
    `${title} — «${productName}»`,
    `المبلغ: ${deposit.amount}`,
  ];
  if (paidOnOrder != null && orderTotal != null) {
    parts.push(`المدفوع على الطلب: ${paidOnOrder}`);
  }
  if (remainingOnOrder != null) {
    parts.push(`الباقي على الطلب: ${remainingOnOrder}`);
  }

  return {
    id: deposit.id,
    date: deposit.createdAt,
    productName,
    orderId: deposit.referenceId,
    kind: "deposit",
    title,
    description: parts.join(" · "),
    amountPaid: deposit.amount,
    orderTotal,
    paidOnOrder,
    remainingOnOrder,
  };
}

function buildOtherLine(tx: EnrichedWalletTx): WalletStatementLine {
  const productName = tx.productName ?? "—";
  let kind: WalletStatementLine["kind"] = "other";
  let title = tx.note ?? tx.type;

  if (tx.type === WALLET_TX_TYPES.UNLOCK) {
    kind = "unlock";
    title = `تحرير مبلغ محجوز — «${productName}»`;
  } else if (tx.type === WALLET_TX_TYPES.SETTLE_TO_PLATFORM) {
    kind = "settle";
    title = `تسوية بعد التسليم — «${productName}»`;
  } else if (tx.type === WALLET_TX_TYPES.REFUND) {
    kind = "refund";
    title = `استرداد — «${productName}»`;
  }

  return {
    id: tx.id,
    date: tx.createdAt,
    productName,
    orderId: tx.referenceId,
    kind,
    title,
    description: title,
    amountPaid: tx.amount,
    orderTotal: null,
    paidOnOrder: null,
    remainingOnOrder: null,
  };
}

/** دمج إيداع+حجز في سطر واحد؛ ترتيب تنازلي للعرض */
export function buildWalletStatement(
  transactions: EnrichedWalletTx[],
): WalletStatementLine[] {
  const sorted = [...transactions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const consumedLockIds = new Set<string>();
  const lines: WalletStatementLine[] = [];

  for (const tx of sorted) {
    if (tx.type === WALLET_TX_TYPES.LOCK) continue;

    if (tx.type === WALLET_TX_TYPES.DEPOSIT) {
      const base = idempotencyBase(tx.idempotencyKey);
      const lock = base
        ? sorted.find(
            (t) =>
              t.type === WALLET_TX_TYPES.LOCK &&
              idempotencyBase(t.idempotencyKey) === base,
          )
        : undefined;
      if (lock) consumedLockIds.add(lock.id);
      lines.push(buildDepositLine(tx));
      continue;
    }

    if (consumedLockIds.has(tx.id)) continue;
    lines.push(buildOtherLine(tx));
  }

  return lines;
}

export function getBuyerWalletDisplayBalances(input: {
  availableBalance: number;
  lockedBalance: number;
}) {
  const locked = Math.max(0, input.lockedBalance);
  const available = Math.max(0, input.availableBalance);
  const spendable = Math.max(0, available - locked);
  return {
    lockedOnOrders: locked,
    spendableBalance: spendable,
    totalTracked: available,
  };
}
