import { SiteHeader } from "@/components/SiteHeader";
import { DeliveryConfirmForm } from "@/components/delivery/DeliveryConfirmForm";
import { requireDeliveryAgent } from "@/lib/auth/guards";
import { getOrderBalances } from "@/lib/orders/order-balances";
import { orderStatusLabel } from "@/lib/orders/labels";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/db/prisma";
import { ORDER_STATUS } from "@/lib/db/constants";

export const metadata = { title: "تأكيد التسليم" };

export default async function DeliveryPage() {
  const session = await requireDeliveryAgent();

  const todayOrders = await prisma.groupBuyOrder.findMany({
    where: { status: ORDER_STATUS.READY_FOR_DELIVERY },
    include: {
      submission: { select: { productName: true } },
      delivery: { select: { codeExpiresAt: true, failedAttempts: true, lockedAt: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-10" dir="rtl">
        <h1 className="text-2xl font-bold text-brand-navy">تأكيد التسليم</h1>
        <p className="mt-1 text-sm text-brand-navy/60">{session.username}</p>

        <div className="mt-8">
          <DeliveryConfirmForm />
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-brand-navy">طلبات جاهزة</h2>
          {todayOrders.length === 0 ? (
            <p className="mt-2 text-sm text-brand-navy/50">لا توجد طلبات حالياً.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {todayOrders.map((o) => {
                const b = getOrderBalances(o);
                return (
                  <li
                    key={o.id}
                    className="rounded-lg border border-brand-gray px-3 py-2 text-sm"
                  >
                    <span className="font-semibold">{o.submission.productName}</span>
                    <span className="mx-2 text-brand-navy/40">·</span>
                    <span className="text-brand-navy/60">{orderStatusLabel(o.status)}</span>
                    <span className="mt-1 block text-xs">
                      {b.fullyPaidOnline ? (
                        <span className="font-semibold text-emerald-700">
                          مدفوع بالكامل — لا تحصيل نقدي
                        </span>
                      ) : (
                        <span className="text-brand-gold">
                          تحصيل نقدي: {formatCurrency(b.codAtDelivery)}
                        </span>
                      )}
                      {o.delivery?.lockedAt ? " · مقفول" : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
