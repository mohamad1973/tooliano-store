import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { NavMenuEditor } from "@/components/admin/cms/NavMenuEditor";
import { WooCategorySyncButton } from "@/components/admin/cms/WooCategorySyncButton";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "قائمة الأقسام" };

export default async function AdminContentMenuPage() {
  await requireAdmin();
  const items = await prisma.navMenuItem.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <AdminShell title="قائمة الأقسام" subtitle="منيو الهيدر — إضافة وحذف وترتيب">
      <AdminContentSubnav active="/admin/content/menu" />
      <WooCategorySyncButton />
      <NavMenuEditor initial={items} />
    </AdminShell>
  );
}
