import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { FooterEditor } from "@/components/admin/cms/FooterEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "الفوتر" };

export default async function AdminContentFooterPage() {
  await requireAdmin();
  const columns = await prisma.footerColumn.findMany({
    orderBy: { sortOrder: "asc" },
    include: { links: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <AdminShell title="الفوتر" subtitle="أعمدة وروابط أسفل الموقع">
      <AdminContentSubnav active="/admin/content/footer" />
      <FooterEditor initial={columns} />
    </AdminShell>
  );
}
