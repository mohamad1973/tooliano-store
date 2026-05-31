import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminResetPasswordForm } from "@/components/admin/AdminResetPasswordForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { USER_ROLES } from "@/lib/db/constants";
import { requireAdmin } from "@/lib/auth/guards";
import { orderStatusLabel } from "@/lib/orders/labels";
import { prisma } from "@/lib/db/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function AdminAgentDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: { id, role: USER_ROLES.DELIVERY_AGENT },
  });
  if (!user) notFound();

  const deliveries = await prisma.deliveryConfirmation.findMany({
    where: { confirmedByAgentId: id, confirmedAt: { not: null } },
    include: {
      order: {
        include: { submission: { select: { productName: true } } },
      },
    },
    orderBy: { confirmedAt: "desc" },
    take: 50,
  });

  return (
    <AdminShell title={`مندوب @${user.username}`} subtitle="تسليمات مؤكدة">
      <Link
        href="/admin/users?role=DELIVERY_AGENT"
        className="text-sm font-semibold text-brand-gold hover:underline"
      >
        ← المستخدمون
      </Link>

      <AdminResetPasswordForm userId={user.id} />

      <h2 className="mb-3 mt-8 text-lg font-bold text-brand-navy">تسليمات</h2>
      <ul className="space-y-2 text-sm">
        {deliveries.map((d) => (
          <li key={d.id} className="rounded-xl border border-brand-gray bg-brand-white p-3">
            {d.order.submission.productName} — {orderStatusLabel(d.order.status)}
            {d.confirmedAt ? (
              <span className="block text-xs text-brand-navy/50">
                {new Date(d.confirmedAt).toLocaleString("ar-EG")}
              </span>
            ) : null}
          </li>
        ))}
        {deliveries.length === 0 ? (
          <li className="text-brand-navy/50">لا تسليمات بعد.</li>
        ) : null}
      </ul>
    </AdminShell>
  );
}
