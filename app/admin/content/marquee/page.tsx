import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { MarqueeEditor } from "@/components/admin/cms/MarqueeEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "الشريط المتحرك" };

export default async function AdminContentMarqueePage() {
  await requireAdmin();
  const items = await prisma.marqueeItem.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <AdminShell title="الشريط المتحرك" subtitle="عبارات أعلى الموقع">
      <AdminContentSubnav active="/admin/content/marquee" />
      <MarqueeEditor initial={items} />
    </AdminShell>
  );
}
