import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { getFinanceSummary } from "@/lib/admin/finance-summary";
import { formatCurrency } from "@/lib/format";
import { orderStatusLabel } from "@/lib/orders/labels";

export const metadata = { title: "المدفوعات" };

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const finance = await getFinanceSummary();

  const buyersWithWallet = await import("@/lib/db/prisma").then((m) =>
    m.prisma.user.findMany({
      where: { role: "BUYER", wallet: { isNot: null } },
      include: { wallet: true },
      take: 100,
      orderBy: { createdAt: "desc" },
    }),
  );

  return (
    <AdminShell title="المدفوعات" subtitle="محافظ المشترين والتحصيل والأرباح">
      <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-brand-gray bg-brand-white p-4">
          <p className="text-xs text-brand-navy/60">إجمالي مدفوع أونلاين</p>
          <p className="text-xl font-bold text-brand-gold">
            {formatCurrency(finance.totalPaidOnline)}
          </p>
        </div>
        <div className="rounded-xl border border-brand-gray bg-brand-white p-4">
          <p className="text-xs text-brand-navy/60">تسويات المنصة</p>
          <p className="text-xl font-bold">{formatCurrency(finance.platformSettled)}</p>
        </div>
        <div className="rounded-xl border border-brand-gray bg-brand-white p-4">
          <p className="text-xs text-brand-navy/60">ربح منصة (مُسلَّم)</p>
          <p className="text-xl font-bold text-emerald-700">
            {formatCurrency(finance.totalMarginDelivered)}
          </p>
        </div>
        <div className="rounded-xl border border-brand-gray bg-brand-white p-4">
          <p className="text-xs text-brand-navy/60">مستحقات تجار (عرض)</p>
          <p className="text-xl font-bold">{formatCurrency(finance.totalVendorOwedDelivered)}</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-brand-navy">محافظ المشترين</h2>
        <div className="overflow-x-auto rounded-xl border border-brand-gray bg-brand-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-brand-gray/30 text-brand-navy/70">
                <th className="p-3 text-right">مشتري</th>
                <th className="p-3 text-right">متاح</th>
                <th className="p-3 text-right">محجوز</th>
                <th className="p-3 text-right">سجل</th>
              </tr>
            </thead>
            <tbody>
              {buyersWithWallet.map((u) => (
                <tr key={u.id} className="border-b border-brand-gray/50">
                  <td className="p-3">@{u.username}</td>
                  <td className="p-3">{formatCurrency(u.wallet!.availableBalance)}</td>
                  <td className="p-3">{formatCurrency(u.wallet!.lockedBalance)}</td>
                  <td className="p-3">
                    <Link
                      href={`/admin/payments/wallets/${u.id}`}
                      className="font-semibold text-brand-gold hover:underline"
                    >
                      عرض
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-brand-navy">آخر الطلبات</h2>
        <ul className="max-h-96 space-y-2 overflow-y-auto text-sm">
          {finance.orderRows.map((o) => (
            <li key={o.id} className="rounded-lg border border-brand-gray bg-brand-white p-3">
              <span className="font-semibold">{o.productName}</span> — @{o.buyerUsername}
              <br />
              {orderStatusLabel(o.status)} · مدفوع {formatCurrency(o.paidOnlineTotal)} · باقي{" "}
              {formatCurrency(o.remainingBalance)}
              {o.fullyPaidOnline ? (
                <span className="mr-2 text-emerald-700"> · مدفوع بالكامل</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-brand-navy">آخر دفعات Paymob</h2>
        <ul className="space-y-2 text-sm">
          {finance.payments.map((p) => (
            <li key={p.id} className="rounded-lg border border-brand-gray bg-brand-white p-3">
              {formatCurrency(p.amount)} — {p.order.submission.productName} — @
              {p.order.buyer.username}
              <span className="block text-xs text-brand-navy/50">
                {new Date(p.createdAt).toLocaleString("ar-EG")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}
