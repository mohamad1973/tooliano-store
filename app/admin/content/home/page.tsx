import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { HomeSectionsEditor } from "@/components/admin/cms/HomeSectionsEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "الصفحة الرئيسية" };

export default async function AdminContentHomePage() {
  await requireAdmin();
  const items = await prisma.homeSection.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <AdminShell title="الصفحة الرئيسية" subtitle="ترتيب وإظهار الأقسام">
      <AdminContentSubnav active="/admin/content/home" />
      <HomeSectionsEditor initial={items} />
    </AdminShell>
  );
}
