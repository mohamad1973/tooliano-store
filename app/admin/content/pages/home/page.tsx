import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { PageBlocksEditor } from "@/components/admin/cms/PageBlocksEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { PAGE_KEYS } from "@/lib/cms/page-blocks";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "كتل الصفحة الرئيسية" };

export default async function AdminHomePageBlocksPage() {
  await requireAdmin();
  const items = await prisma.pageBlock.findMany({
    where: { pageKey: PAGE_KEYS.HOME },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <AdminShell
      title="كتل الصفحة الرئيسية"
      subtitle="سحب وإفلات — بانر، نص، أزرار"
    >
      <AdminContentSubnav active="/admin/content/pages/home" />
      <PageBlocksEditor initial={items} />
    </AdminShell>
  );
}
