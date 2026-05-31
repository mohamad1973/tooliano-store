import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { USER_ROLES, type UserRole } from "@/lib/db/constants";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "المستخدمون" };

const ROLE_TABS: { role: UserRole; label: string; detailPrefix: string }[] = [
  { role: USER_ROLES.ADMIN, label: "مديرون", detailPrefix: "" },
  { role: USER_ROLES.VENDOR, label: "تجار", detailPrefix: "/admin/users/vendors" },
  { role: USER_ROLES.BUYER, label: "مشترون", detailPrefix: "/admin/users/buyers" },
  {
    role: USER_ROLES.DELIVERY_AGENT,
    label: "مندوبو تسليم",
    detailPrefix: "/admin/users/delivery-agents",
  },
];

type Props = { searchParams: Promise<{ role?: string }> };

export default async function AdminUsersPage({ searchParams }: Props) {
  await requireAdmin();
  const { role: roleParam } = await searchParams;
  const activeRole =
    ROLE_TABS.find((t) => t.role === roleParam)?.role ?? USER_ROLES.BUYER;

  const [users, counts] = await Promise.all([
    prisma.user.findMany({
      where: { role: activeRole },
      select: {
        id: true,
        username: true,
        phone: true,
        email: true,
        disabled: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
  ]);

  const countMap = Object.fromEntries(
    counts.map((c) => [c.role, c._count.id]),
  );

  const tab = ROLE_TABS.find((t) => t.role === activeRole)!;

  return (
    <AdminShell title="المستخدمون" subtitle="إدارة الحسابات وإعادة تعيين كلمة المرور">
      <div className="mb-6 flex flex-wrap gap-2">
        {ROLE_TABS.map((t) => (
          <Link
            key={t.role}
            href={`/admin/users?role=${t.role}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              t.role === activeRole
                ? "bg-brand-navy text-brand-white"
                : "bg-brand-white text-brand-navy border border-brand-gray"
            }`}
          >
            {t.label} ({countMap[t.role] ?? 0})
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-brand-gray bg-brand-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-gray bg-brand-gray/30 text-brand-navy/70">
              <th className="p-3 text-right">المستخدم</th>
              <th className="p-3 text-right">هاتف</th>
              <th className="p-3 text-right">بريد</th>
              <th className="p-3 text-right">تاريخ</th>
              <th className="p-3 text-right">تفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-brand-gray/60">
                <td className="p-3 font-semibold">@{u.username}</td>
                <td className="p-3" dir="ltr">
                  {u.phone ?? "—"}
                </td>
                <td className="p-3">{u.email ?? "—"}</td>
                <td className="p-3 text-xs text-brand-navy/60">
                  {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                </td>
                <td className="p-3">
                  {tab.detailPrefix ? (
                    <Link
                      href={`${tab.detailPrefix}/${u.id}`}
                      className="font-semibold text-brand-gold hover:underline"
                    >
                      عرض
                    </Link>
                  ) : (
                    <span className="text-brand-navy/40">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 ? (
          <p className="p-6 text-center text-brand-navy/50">لا مستخدمين.</p>
        ) : null}
      </div>
    </AdminShell>
  );
}
