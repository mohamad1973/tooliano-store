import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { WALLET_TX_TYPES } from "@/lib/db/constants";
import { getWalletTransactions } from "@/lib/orders/buyer-orders";
import { enrichWalletTransactions } from "@/lib/wallet/transaction-view";
import { formatCurrency } from "@/lib/format";

export const metadata = { title: "المحفظة" };

const TX_LABELS: Record<string, string> = {
  [WALLET_TX_TYPES.DEPOSIT]: "إيداع",
  [WALLET_TX_TYPES.LOCK]: "حجز",
  [WALLET_TX_TYPES.UNLOCK]: "تحرير",
  [WALLET_TX_TYPES.SETTLE_TO_PLATFORM]: "تسوية للمنصة",
  [WALLET_TX_TYPES.REFUND]: "استرداد",
};

export default async function WalletPage() {
  const session = await getSession();
  if (!session) return null;

  const transactions = await getWalletTransactions(session.userId, 500);
  const txs = await enrichWalletTransactions(transactions);

  return (
    <div dir="rtl">
      <Link href="/account" className="text-sm font-semibold text-brand-gold hover:underline">
        ← حسابي
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-brand-navy">سجل المحفظة</h1>
      <p className="mt-1 text-sm text-brand-navy/60">
        السجل كامل ولا يُحذف — كل دفعة بالتاريخ واسم المنتج.
      </p>

      {txs.length === 0 ? (
        <p className="mt-6 text-sm text-brand-navy/60">لا توجد معاملات بعد.</p>
      ) : (
        <ul className="mt-6 space-y-2">
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
              <p className="text-xs text-brand-navy/40">
                متاح: {formatCurrency(t.balanceAfterAvailable)} · محجوز:{" "}
                {formatCurrency(t.balanceAfterLocked)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
