import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminOverviewStats } from "@/lib/admin/overview-stats";
import { requireAdmin } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/format";
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";

export const metadata = { title: "Dashboard" };

export default async function AdminOverviewPage() {
  const session = await requireAdmin();
  const stats = await getAdminOverviewStats();

  const cards = [
    { label: "Administrators", value: stats.adminCount, href: "/admin/users?role=ADMIN" },
    { label: "Vendors", value: stats.vendorCount, href: "/admin/users?role=VENDOR" },
    { label: "Buyers", value: stats.buyerCount, href: "/admin/users?role=BUYER" },
    {
      label: "Delivery Agents",
      value: stats.agentCount,
      href: "/admin/users?role=DELIVERY_AGENT",
    },
    {
      label: "Pending Vendors",
      value: stats.pendingVendors,
      href: "/admin/operations",
    },
    {
      label: "Pending Products",
      value: stats.pendingProducts,
      href: "/admin/operations",
    },
    { label: "Paid Orders", value: stats.paidOrders, href: "/admin/payments" },
  ];

  return (
    <AdminShell
      title="Dashboard"
      subtitle={`Welcome, ${session.username}`}
    >
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border border-[#c3c4c7] bg-white p-4 shadow-sm transition hover:border-[#2271b1]"
          >
            <p className="text-sm text-[#50575e]">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#1d2327]">{c.value}</p>
          </Link>
        ))}
      </div>

      <section className="mb-5 border border-[#c3c4c7] bg-white shadow-sm">
        <div className="border-b border-[#c3c4c7] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#1d2327]">Notifications</h2>
        </div>
        <div className="p-4">
          <NotificationsPanel />
        </div>
        <p className="border-t border-[#dcdcde] px-4 py-3 text-xs text-[#646970]">
          <Link href="/admin/payments" className="font-semibold text-[#2271b1] hover:underline">
            View orders and payments
          </Link>
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="border border-[#c3c4c7] bg-white p-4 shadow-sm">
          <p className="text-sm text-[#50575e]">Total Online Paid Orders</p>
          <p className="mt-2 text-2xl font-semibold text-[#2271b1]">
            {formatCurrency(stats.totalPaidOnline)}
          </p>
        </div>
        <div className="border border-[#c3c4c7] bg-white p-4 shadow-sm">
          <p className="text-sm text-[#50575e]">Platform Settlements After Delivery</p>
          <p className="mt-2 text-2xl font-semibold text-[#1d2327]">
            {formatCurrency(stats.platformSettled)}
          </p>
        </div>
      </section>
    </AdminShell>
  );
}
