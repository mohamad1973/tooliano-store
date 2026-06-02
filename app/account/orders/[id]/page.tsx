import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ORDER_STATUS } from "@/lib/db/constants";
import { getBuyerOrderDetail } from "@/lib/orders/buyer-orders";
import { getOrderBalances } from "@/lib/orders/order-balances";
import { orderStatusLabel } from "@/lib/orders/labels";
import { formatCurrency } from "@/lib/format";
import { PayOrderButton } from "@/components/orders/PayOrderButton";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata() {
  return { title: "تفاصيل الطلب" };
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const detail = await getBuyerOrderDetail(session.userId, id);
  if (!detail) notFound();

  const { order, deliveryCode } = detail;
  const balances = getOrderBalances(order);

  const canPayMore =
    !balances.fullyPaidOnline &&
    order.status !== ORDER_STATUS.CAMPAIGN_FAILED &&
    order.status !== ORDER_STATUS.CANCELLED &&
    order.status !== ORDER_STATUS.DELIVERED;

  const isFirstPayment = balances.paidOnlineTotal <= 0.01;
  const payButtonProps = {
    orderId: order.id,
    lineTotal: balances.lineTotal,
    paidOnlineTotal: balances.paidOnlineTotal,
    remainingBalance: balances.remainingBalance,
    minDepositAmount: balances.minDepositAmount,
    isFirstPayment,
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Link href="/account" className="text-sm font-semibold text-brand-gold hover:underline">
        ← حسابي
      </Link>

      <h1 className="text-2xl font-bold text-brand-navy">
        {order.submission.productName}
      </h1>
      <p className="text-sm font-medium text-brand-navy/70">
        {orderStatusLabel(order.status)}
      </p>

      <dl className="grid gap-2 rounded-xl border border-brand-gray bg-brand-white p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-brand-navy/60">قيمة الطلب</dt>
          <dd className="font-semibold">{formatCurrency(balances.lineTotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-brand-navy/60">مدفوع أونلاين</dt>
          <dd className="font-semibold text-brand-gold">
            {formatCurrency(balances.paidOnlineTotal)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-brand-navy/60">الباقي</dt>
          <dd className="font-semibold">{formatCurrency(balances.remainingBalance)}</dd>
        </div>
        {balances.fullyPaidOnline ? (
          <p className="text-xs text-emerald-700">مدفوع بالكامل — لا مبلغ نقدي عند الاستلام</p>
        ) : balances.remainingBalance > 0 ? (
          <p className="text-xs text-brand-navy/60">
            المتبقي نقداً للمندوب: {formatCurrency(balances.codAtDelivery)}
          </p>
        ) : null}
      </dl>

      {order.status === ORDER_STATUS.PENDING_PAYMENT ? (
        <PayOrderButton {...payButtonProps} />
      ) : null}

      {canPayMore && order.status !== ORDER_STATUS.PENDING_PAYMENT ? (
        <PayOrderButton {...payButtonProps} isFirstPayment={false} />
      ) : null}

      {order.status === ORDER_STATUS.READY_FOR_DELIVERY && deliveryCode ? (
        <section className="rounded-2xl border-2 border-brand-gold bg-brand-gold/10 p-6 text-center">
          <p className="text-sm font-semibold text-brand-navy">كود التسليم (6 أرقام)</p>
          <p className="mt-2 font-mono text-4xl font-bold tracking-widest text-brand-navy">
            {deliveryCode}
          </p>
          <p className="mt-3 text-xs text-brand-navy/60">
            {balances.fullyPaidOnline
              ? "اعرض الكود للمندوب مقابل استلام البضاعة — بدون دفع نقدي."
              : `اعرض الكود وادفع ${formatCurrency(balances.codAtDelivery)} نقداً للمندوب.`}
          </p>
        </section>
      ) : null}

      {order.status === ORDER_STATUS.DELIVERED ? (
        <p className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
          تم تأكيد التسليم. شكراً لك!
        </p>
      ) : null}

      {order.status === ORDER_STATUS.CAMPAIGN_FAILED ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          فشلت الحملة. المبالغ المدفوعة أصبحت متاحة في محفظتك.
        </p>
      ) : null}
    </div>
  );
}
