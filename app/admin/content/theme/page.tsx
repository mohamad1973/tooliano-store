import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { ThemeColorsForm } from "@/components/admin/cms/ThemeColorsForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { DEFAULT_THEME_COLORS } from "@/lib/cms/defaults";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "ألوان الثيم" };

export default async function AdminContentThemePage() {
  await requireAdmin();
  const rows = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const initial = { ...DEFAULT_THEME_COLORS, ...map };

  return (
    <AdminShell title="ألوان الثيم" subtitle="ألوان العلامة على الموقع">
      <AdminContentSubnav active="/admin/content/theme" />
      <ThemeColorsForm initial={initial} />
    </AdminShell>
  );
}
