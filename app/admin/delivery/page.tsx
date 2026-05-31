import { AdminDeliveryAgents } from "@/components/admin/AdminDeliveryAgents";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { getOrderBalances } from "@/lib/orders/order-balances";
import { orderStatusLabel } from "@/lib/orders/labels";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "إدارة التسليم" };

export default async function AdminDeliveryPage() {
  const session = await requireAdmin();

  const [orders, platformTotal, agents] = await Promise.all([
    prisma.groupBuyOrder.findMany({
      include: {
        buyer: { select: { username: true } },
        submission: { select: { productName: true } },
        delivery: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.platformLedgerEntry.aggregate({ _sum: { amount: true } }),
    prisma.user.findMany({
      where: { role: "DELIVERY_AGENT" },
      select: { id: true, username: true, phone: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AdminShell
      title="التسليم"
      subtitle={`مرحباً ${session.username}`}
    >
      <p className="mb-6 text-sm text-brand-navy/70">
        إجمالي تسويات المنصة:{" "}
        <strong className="text-brand-gold">
          {formatCurrency(platformTotal._sum.amount ?? 0)}
        </strong>
      </p>

      <AdminDeliveryAgents initialAgents={agents} />

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-brand-navy">الطلبات ({orders.length})</h2>
        <div className="space-y-3">
          {orders.map((o) => {
            const b = getOrderBalances(o);
            return (
              <article
                key={o.id}
                className="rounded-xl border border-brand-gray bg-brand-white p-4 text-sm"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-bold">{o.submission.productName}</span>
                  <span className="text-xs">{orderStatusLabel(o.status)}</span>
                </div>
                <p className="mt-1 text-brand-navy/60">
                  @{o.buyer.username} · كمية {o.quantity} · مدفوع{" "}
                  {formatCurrency(b.paidOnlineTotal)}
                  {b.fullyPaidOnline ? (
                    <span className="mr-1 text-emerald-700"> · مدفوع بالكامل</span>
                  ) : (
                    <span> · باقي {formatCurrency(b.remainingBalance)}</span>
                  )}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
