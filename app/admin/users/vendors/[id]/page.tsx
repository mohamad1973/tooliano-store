import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminResetPasswordForm } from "@/components/admin/AdminResetPasswordForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { USER_ROLES } from "@/lib/db/constants";
import { requireAdmin } from "@/lib/auth/guards";
import { getVendorOrderSummaries } from "@/lib/vendor/submission-orders";
import { orderStatusLabel } from "@/lib/orders/labels";
import { approvalStatusLabel } from "@/lib/approval-labels";
import { prisma } from "@/lib/db/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function AdminVendorDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: { id, role: USER_ROLES.VENDOR },
    include: { vendorProfile: true },
  });
  if (!user?.vendorProfile) notFound();

  const campaigns = await getVendorOrderSummaries(id);
  const vp = user.vendorProfile;

  return (
    <AdminShell title={`تاجر @${user.username}`} subtitle={vp.companyName}>
      <Link href="/admin/users?role=VENDOR" className="text-sm font-semibold text-brand-gold hover:underline">
        ← المستخدمون
      </Link>

      <dl className="mt-6 grid gap-2 rounded-xl border border-brand-gray bg-brand-white p-4 text-sm">
        <div>
          <dt className="text-brand-navy/60">الشركة</dt>
          <dd className="font-semibold">{vp.companyName}</dd>
        </div>
        <div>
          <dt className="text-brand-navy/60">الحالة</dt>
          <dd>{approvalStatusLabel(vp.status)}</dd>
        </div>
        <div>
          <dt className="text-brand-navy/60">هاتف</dt>
          <dd dir="ltr">{vp.phone}</dd>
        </div>
        <div>
          <dt className="text-brand-navy/60">بريد</dt>
          <dd>{vp.contactEmail}</dd>
        </div>
      </dl>

      <AdminResetPasswordForm userId={user.id} />

      <h2 className="mb-3 mt-8 text-lg font-bold text-brand-navy">حملات (بدون مبالغ عملاء)</h2>
      <ul className="space-y-2">
        {campaigns.map((c) => (
          <li key={c.id} className="rounded-xl border border-brand-gray bg-brand-white p-3 text-sm">
            <p className="font-semibold">{c.productName}</p>
            <p className="text-brand-navy/60">
              محجوز {c.reservedQuantity}/{c.targetQuantity}
            </p>
            {c.orders.map((o) => (
              <p key={o.id} className="text-xs text-brand-navy/50">
                كمية {o.quantity} — {orderStatusLabel(o.status)}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
