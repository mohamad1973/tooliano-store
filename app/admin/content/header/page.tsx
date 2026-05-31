import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { HeaderSettingsForm } from "@/components/admin/cms/HeaderSettingsForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";

export const metadata = { title: "تحرير الهيدر" };

export default async function AdminContentHeaderPage() {
  await requireAdmin();
  const rows = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const initial = { ...DEFAULT_SITE_SETTINGS, ...map };

  return (
    <AdminShell title="الهيدر" subtitle="اسم الموقع والشعار والماركوي">
      <AdminContentSubnav active="/admin/content/header" />
      <HeaderSettingsForm initial={initial} />
    </AdminShell>
  );
}
