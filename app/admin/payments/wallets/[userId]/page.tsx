import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { USER_ROLES, WALLET_TX_TYPES } from "@/lib/db/constants";
import { requireAdmin } from "@/lib/auth/guards";
import { enrichWalletTransactions } from "@/lib/wallet/transaction-view";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/db/prisma";

const TX_LABELS: Record<string, string> = {
  [WALLET_TX_TYPES.DEPOSIT]: "إيداع",
  [WALLET_TX_TYPES.LOCK]: "حجز",
  [WALLET_TX_TYPES.UNLOCK]: "تحرير",
  [WALLET_TX_TYPES.SETTLE_TO_PLATFORM]: "تسوية للمنصة",
  [WALLET_TX_TYPES.REFUND]: "استرداد",
};

type Props = { params: Promise<{ userId: string }> };

export default async function AdminWalletDetailPage({ params }: Props) {
  await requireAdmin();
  const { userId } = await params;

  const user = await prisma.user.findFirst({
    where: { id: userId, role: USER_ROLES.BUYER },
    include: {
      wallet: {
        include: {
          transactions: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
  if (!user?.wallet) notFound();

  const txs = await enrichWalletTransactions(user.wallet.transactions);

  return (
    <AdminShell
      title={`محفظة @${user.username}`}
      subtitle="سجل كامل — لا يُحذف"
    >
      <Link href="/admin/payments" className="text-sm font-semibold text-brand-gold hover:underline">
        ← المدفوعات
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-brand-gray bg-brand-white p-4">
          <p className="text-sm text-brand-navy/60">متاح</p>
          <p className="text-2xl font-bold text-brand-gold">
            {formatCurrency(user.wallet.availableBalance)}
          </p>
        </div>
        <div className="rounded-xl border border-brand-gray bg-brand-white p-4">
          <p className="text-sm text-brand-navy/60">محجوز</p>
          <p className="text-2xl font-bold">{formatCurrency(user.wallet.lockedBalance)}</p>
        </div>
      </div>

      <ul className="mt-8 space-y-2">
        {txs.map((t) => (
          <li
            key={t.id}
            className="rounded-xl border border-brand-gray bg-brand-white px-4 py-3 text-sm"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-semibold">{TX_LABELS[t.type] ?? t.type}</span>
              <span className="text-brand-gold">{formatCurrency(t.amount)}</span>
            </div>
            <p className="mt-1 text-xs text-brand-navy/60">
              {new Date(t.createdAt).toLocaleString("ar-EG")}
              {t.productName ? ` · ${t.productName}` : ""}
            </p>
            {t.note ? <p className="text-xs text-brand-navy/70">{t.note}</p> : null}
            {t.parsedMeta?.remainingAfter != null ? (
              <p className="text-xs text-brand-navy/50">
                باقي بعد الدفعة: {formatCurrency(Number(t.parsedMeta.remainingAfter))}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
