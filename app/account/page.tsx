import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getBuyerAccountSummary } from "@/lib/orders/buyer-orders";
import { orderStatusLabel } from "@/lib/orders/labels";
import { formatCurrency } from "@/lib/format";
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";
import { getBuyerWalletDisplayBalances } from "@/lib/wallet/statement";

export const metadata = { title: "حسابي" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) return null;

  const { wallet, orders } = await getBuyerAccountSummary(session.userId);
  const balances = getBuyerWalletDisplayBalances(wallet);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">حسابي</h1>
        <p className="mt-1 text-sm text-brand-navy/70">مرحباً، {session.username}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-brand-gray bg-brand-white p-5 shadow-sm">
          <p className="text-sm text-brand-navy/60">مدفوع على طلباتك (محجوز)</p>
          <p className="mt-1 text-2xl font-bold text-brand-navy">
            {formatCurrency(balances.lockedOnOrders)}
          </p>
          <p className="mt-1 text-xs text-brand-navy/50">
            مبالغ دفعتها ومربوطة بطلبات نشطة
          </p>
        </div>
        <div className="rounded-2xl border border-brand-gray bg-brand-white p-5 shadow-sm">
          <p className="text-sm text-brand-navy/60">رصيد متاح للاستخدام</p>
          <p className="mt-1 text-2xl font-bold text-brand-gold">
            {formatCurrency(balances.spendableBalance)}
          </p>
          <p className="mt-1 text-xs text-brand-navy/50">
            يظهر بعد تحرير مبلغ (مثلاً فشل حملة)
          </p>
        </div>
      </section>

      <p>
        <Link
          href="/account/wallet"
          className="text-sm font-semibold text-brand-gold hover:underline"
        >
          كشف المحفظة ←
        </Link>
      </p>

      <section>
        <h2 className="text-lg font-bold text-brand-navy">الإشعارات</h2>
        <div className="mt-4 rounded-2xl border border-brand-gray bg-brand-white p-5 shadow-sm">
          <NotificationsPanel orderLinkPrefix="/account/orders" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-navy">طلباتي</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-brand-navy/60">لا توجد طلبات بعد.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/account/orders/${o.id}`}
                  className="block rounded-xl border border-brand-gray bg-brand-white p-4 transition hover:border-brand-gold"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-brand-navy">
                      {o.submission.productName}
                    </span>
                    <span className="text-xs font-medium text-brand-navy/60">
                      {orderStatusLabel(o.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-brand-navy/70">
                    كمية {o.quantity} — مقدم {formatCurrency(o.depositAmount)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
