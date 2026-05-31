import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminResetPasswordForm } from "@/components/admin/AdminResetPasswordForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { USER_ROLES } from "@/lib/db/constants";
import { requireAdmin } from "@/lib/auth/guards";
import { getOrderBalances } from "@/lib/orders/order-balances";
import { orderStatusLabel } from "@/lib/orders/labels";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/db/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function AdminBuyerDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: { id, role: USER_ROLES.BUYER },
    include: {
      wallet: true,
      groupBuyOrders: {
        include: { submission: { select: { productName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) notFound();

  return (
    <AdminShell title={`مشتري @${user.username}`} subtitle="تفاصيل الحساب والطلبات">
      <Link href="/admin/users?role=BUYER" className="text-sm font-semibold text-brand-gold hover:underline">
        ← المستخدمون
      </Link>

      <dl className="mt-6 grid gap-2 rounded-xl border border-brand-gray bg-brand-white p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-brand-navy/60">هاتف</dt>
          <dd dir="ltr">{user.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-brand-navy/60">بريد</dt>
          <dd>{user.email ?? "—"}</dd>
        </div>
        {user.wallet ? (
          <>
            <div>
              <dt className="text-brand-navy/60">رصيد متاح</dt>
              <dd className="font-bold text-brand-gold">
                {formatCurrency(user.wallet.availableBalance)}
              </dd>
            </div>
            <div>
              <dt className="text-brand-navy/60">محجوز</dt>
              <dd>{formatCurrency(user.wallet.lockedBalance)}</dd>
            </div>
          </>
        ) : null}
      </dl>

      <p className="mt-4">
        <Link
          href={`/admin/payments/wallets/${user.id}`}
          className="font-semibold text-brand-gold hover:underline"
        >
          سجل المحفظة الكامل →
        </Link>
      </p>

      <AdminResetPasswordForm userId={user.id} />

      <h2 className="mb-3 mt-8 text-lg font-bold text-brand-navy">الطلبات</h2>
      <ul className="space-y-2">
        {user.groupBuyOrders.map((o) => {
          const b = getOrderBalances(o);
          return (
            <li
              key={o.id}
              className="rounded-xl border border-brand-gray bg-brand-white p-3 text-sm"
            >
              <p className="font-semibold">{o.submission.productName}</p>
              <p className="text-brand-navy/60">
                {orderStatusLabel(o.status)} · مدفوع {formatCurrency(b.paidOnlineTotal)}{" "}
                / باقي {formatCurrency(b.remainingBalance)}
              </p>
            </li>
          );
        })}
      </ul>
    </AdminShell>
  );
}
