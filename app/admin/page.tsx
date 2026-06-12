import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminOverviewStats } from "@/lib/admin/overview-stats";
import { requireAdmin } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/format";
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";

export const metadata = { title: "ملخص الإدارة" };

export default async function AdminOverviewPage() {
  const session = await requireAdmin();
  const stats = await getAdminOverviewStats();

  const cards = [
    { label: "مديرون", value: stats.adminCount, href: "/admin/users?role=ADMIN" },
    { label: "تجار", value: stats.vendorCount, href: "/admin/users?role=VENDOR" },
    { label: "مشترون", value: stats.buyerCount, href: "/admin/users?role=BUYER" },
    {
      label: "مندوبو تسليم",
      value: stats.agentCount,
      href: "/admin/users?role=DELIVERY_AGENT",
    },
    {
      label: "تجار قيد المراجعة",
      value: stats.pendingVendors,
      href: "/admin/operations",
    },
    {
      label: "منتجات قيد المراجعة",
      value: stats.pendingProducts,
      href: "/admin/operations",
    },
    { label: "طلبات مدفوعة", value: stats.paidOrders, href: "/admin/payments" },
  ];

  return (
    <AdminShell
      title="الملخص"
      subtitle={`مرحباً ${session.username}`}
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-brand-gray bg-brand-white p-5 shadow-sm transition hover:border-brand-gold"
          >
            <p className="text-sm text-brand-navy/60">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-brand-navy">{c.value}</p>
          </Link>
        ))}
      </div>

      <section className="mb-8 rounded-2xl border border-brand-gray bg-brand-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-brand-navy">الإشعارات</h2>
        <div className="mt-4">
          <NotificationsPanel />
        </div>
        <p className="mt-3 text-xs text-brand-navy/50">
          <Link href="/admin/payments" className="font-semibold text-brand-gold hover:underline">
            عرض الطلبات والمدفوعات ←
          </Link>
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-brand-gray bg-brand-white p-5">
          <p className="text-sm text-brand-navy/60">إجمالي مدفوع أونلاين (طلبات)</p>
          <p className="mt-2 text-2xl font-bold text-brand-gold">
            {formatCurrency(stats.totalPaidOnline)}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-gray bg-brand-white p-5">
          <p className="text-sm text-brand-navy/60">تسويات المنصة بعد التسليم</p>
          <p className="mt-2 text-2xl font-bold text-brand-navy">
            {formatCurrency(stats.platformSettled)}
          </p>
        </div>
      </section>
    </AdminShell>
  );
}
