import "server-only";

import { prisma } from "@/lib/db/prisma";
import { WALLET_TX_TYPES, type WalletTxType } from "@/lib/db/constants";

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function ensureWallet(userId: string, tx?: TxClient) {
  const db = tx ?? prisma;
  const existing = await db.wallet.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.wallet.create({
    data: { userId, availableBalance: 0, lockedBalance: 0 },
  });
}

async function appendTransaction(
  tx: TxClient,
  input: {
    walletId: string;
    type: WalletTxType;
    amount: number;
    availableBalance: number;
    lockedBalance: number;
    referenceType?: string;
    referenceId?: string;
    idempotencyKey?: string;
    note?: string;
    metadata?: string;
  },
) {
  if (input.idempotencyKey) {
    const dup = await tx.walletTransaction.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (dup) return dup;
  }

  return tx.walletTransaction.create({
    data: {
      walletId: input.walletId,
      type: input.type,
      amount: input.amount,
      balanceAfterAvailable: input.availableBalance,
      balanceAfterLocked: input.lockedBalance,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      idempotencyKey: input.idempotencyKey,
      note: input.note,
      metadata: input.metadata,
    },
  });
}

/** إيداع ثم قفل على طلب — بعد دفع ناجح */
export async function depositAndLockForOrder(input: {
  userId: string;
  orderId: string;
  amount: number;
  idempotencyKey: string;
  note?: string;
  metadata?: Record<string, unknown>;
}) {
  const noteDeposit = input.note ?? "إيداع على طلب شراء جماعي";
  const noteLock = input.note
    ? `حجز — ${input.note}`
    : "حجز على طلب شراء جماعي";
  const metaJson = input.metadata
    ? JSON.stringify(input.metadata)
    : undefined;
  return prisma.$transaction(async (tx) => {
    const wallet = await ensureWallet(input.userId, tx);
    const available = wallet.availableBalance + input.amount;
    const locked = wallet.lockedBalance + input.amount;

    await appendTransaction(tx, {
      walletId: wallet.id,
      type: WALLET_TX_TYPES.DEPOSIT,
      amount: input.amount,
      availableBalance: available,
      lockedBalance: wallet.lockedBalance,
      referenceType: "order",
      referenceId: input.orderId,
      idempotencyKey: `${input.idempotencyKey}:deposit`,
      note: noteDeposit,
      metadata: metaJson,
    });

    await appendTransaction(tx, {
      walletId: wallet.id,
      type: WALLET_TX_TYPES.LOCK,
      amount: input.amount,
      availableBalance: available,
      lockedBalance: locked,
      referenceType: "order",
      referenceId: input.orderId,
      idempotencyKey: `${input.idempotencyKey}:lock`,
      note: noteLock,
      metadata: metaJson,
    });

    return tx.wallet.update({
      where: { id: wallet.id },
      data: { availableBalance: available, lockedBalance: locked },
    });
  });
}

/** تحرير مبلغ محجوز (فشل حملة) */
export async function unlockOrderDeposit(input: {
  userId: string;
  orderId: string;
  amount: number;
  idempotencyKey: string;
}) {
  return prisma.$transaction(async (tx) => {
    const wallet = await ensureWallet(input.userId, tx);
    const available = wallet.availableBalance + input.amount;
    const locked = Math.max(0, wallet.lockedBalance - input.amount);

    await appendTransaction(tx, {
      walletId: wallet.id,
      type: WALLET_TX_TYPES.UNLOCK,
      amount: input.amount,
      availableBalance: available,
      lockedBalance: locked,
      referenceType: "order",
      referenceId: input.orderId,
      idempotencyKey: input.idempotencyKey,
      note: "تحرير بعد فشل الحملة",
    });

    return tx.wallet.update({
      where: { id: wallet.id },
      data: { availableBalance: available, lockedBalance: locked },
    });
  });
}

/** خصم 5% لحساب المنصة عند التسليم */
export async function settleOrderToPlatform(input: {
  userId: string;
  orderId: string;
  amount: number;
  idempotencyKey: string;
  note?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const wallet = await ensureWallet(input.userId, tx);
    const locked = Math.max(0, wallet.lockedBalance - input.amount);

    await appendTransaction(tx, {
      walletId: wallet.id,
      type: WALLET_TX_TYPES.SETTLE_TO_PLATFORM,
      amount: input.amount,
      availableBalance: wallet.availableBalance,
      lockedBalance: locked,
      referenceType: "order",
      referenceId: input.orderId,
      idempotencyKey: input.idempotencyKey,
      note: input.note ?? "تسوية لحساب المنصة بعد التسليم",
    });

    await tx.platformLedgerEntry.create({
      data: {
        amount: input.amount,
        orderId: input.orderId,
        note: input.note ?? "تسوية بعد التسليم",
      },
    });

    return tx.wallet.update({
      where: { id: wallet.id },
      data: { lockedBalance: locked },
    });
  });
}

export async function getWalletSummary(userId: string) {
  const wallet = await ensureWallet(userId);
  return {
    availableBalance: wallet.availableBalance,
    lockedBalance: wallet.lockedBalance,
    currency: wallet.currency,
    totalBalance: wallet.availableBalance + wallet.lockedBalance,
  };
}

/** عمولة إحالة — تُضاف للرصيد المتاح دون قفل */
export async function creditAffiliateCommission(input: {
  userId: string;
  orderId: string;
  amount: number;
  idempotencyKey: string;
  note?: string;
  metadata?: Record<string, unknown>;
}) {
  if (input.amount <= 0) return null;

  const metaJson = input.metadata
    ? JSON.stringify(input.metadata)
    : undefined;

  return prisma.$transaction(async (tx) => {
    const wallet = await ensureWallet(input.userId, tx);
    const available = wallet.availableBalance + input.amount;

    await appendTransaction(tx, {
      walletId: wallet.id,
      type: WALLET_TX_TYPES.AFFILIATE_COMMISSION,
      amount: input.amount,
      availableBalance: available,
      lockedBalance: wallet.lockedBalance,
      referenceType: "affiliate_order",
      referenceId: input.orderId,
      idempotencyKey: input.idempotencyKey,
      note: input.note ?? "عمولة إحالة",
      metadata: metaJson,
    });

    return tx.wallet.update({
      where: { id: wallet.id },
      data: { availableBalance: available },
    });
  });
}

/** خصم عمولة عند فشل الصفقة — لا رصيد سالب */
export async function reverseAffiliateCommission(input: {
  userId: string;
  orderId: string;
  amount: number;
  idempotencyKey: string;
  note?: string;
  metadata?: Record<string, unknown>;
}) {
  if (input.amount <= 0) return null;

  const metaJson = input.metadata
    ? JSON.stringify(input.metadata)
    : undefined;

  return prisma.$transaction(async (tx) => {
    const wallet = await ensureWallet(input.userId, tx);
    const deduct = Math.min(wallet.availableBalance, input.amount);
    if (deduct <= 0) {
      await appendTransaction(tx, {
        walletId: wallet.id,
        type: WALLET_TX_TYPES.AFFILIATE_REVERSAL,
        amount: 0,
        availableBalance: wallet.availableBalance,
        lockedBalance: wallet.lockedBalance,
        referenceType: "affiliate_order",
        referenceId: input.orderId,
        idempotencyKey: input.idempotencyKey,
        note:
          input.note ??
          "خصم عمولة — الرصيد غير كافٍ للخصم الكامل",
        metadata: metaJson,
      });
      return wallet;
    }

    const available = wallet.availableBalance - deduct;

    await appendTransaction(tx, {
      walletId: wallet.id,
      type: WALLET_TX_TYPES.AFFILIATE_REVERSAL,
      amount: deduct,
      availableBalance: available,
      lockedBalance: wallet.lockedBalance,
      referenceType: "affiliate_order",
      referenceId: input.orderId,
      idempotencyKey: input.idempotencyKey,
      note: input.note ?? "خصم عمولة — فشل الصفقة",
      metadata: metaJson,
    });

    return tx.wallet.update({
      where: { id: wallet.id },
      data: { availableBalance: available },
    });
  });
}
