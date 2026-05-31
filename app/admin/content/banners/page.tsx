import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { BannersEditor } from "@/components/admin/cms/BannersEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "بنرات التصنيفات" };

export default async function AdminContentBannersPage() {
  await requireAdmin();
  const items = await prisma.homeBanner.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <AdminShell title="البنرات" subtitle="صور الصفحة الرئيسية">
      <AdminContentSubnav active="/admin/content/banners" />
      <BannersEditor initial={items} />
    </AdminShell>
  );
}
