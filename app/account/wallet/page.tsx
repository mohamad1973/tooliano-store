import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getWalletTransactions } from "@/lib/orders/buyer-orders";
import { enrichWalletTransactions } from "@/lib/wallet/transaction-view";
import { buildWalletStatement } from "@/lib/wallet/statement";
import { WalletStatement } from "@/components/wallet/WalletStatement";

export const metadata = { title: "المحفظة" };

export default async function WalletPage() {
  const session = await getSession();
  if (!session) return null;

  const transactions = await getWalletTransactions(session.userId, 500);
  const txs = await enrichWalletTransactions(transactions);
  const lines = buildWalletStatement(txs);

  return (
    <div dir="rtl">
      <Link href="/account" className="text-sm font-semibold text-brand-gold hover:underline">
        ← حسابي
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-brand-navy">كشف المحفظة</h1>
      <p className="mt-1 text-sm text-brand-navy/60">
        سجل بنكي لحركات حسابك — كل دفعة حجز بالمبلغ والباقي على الطلب.
      </p>

      <div className="mt-6">
        <WalletStatement lines={lines} />
      </div>
    </div>
  );
}
