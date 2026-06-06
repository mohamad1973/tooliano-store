import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { SocialLinksEditor } from "@/components/admin/cms/SocialLinksEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "وسائل التواصل" };

export default async function AdminContentSocialPage() {
  await requireAdmin();

  const [links, settingRows] = await Promise.all([
    prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "socialShowHeader",
            "socialShowFooter",
            "socialShowSide",
            "socialSidePosition",
            "socialClickMode",
          ],
        },
      },
    }),
  ]);

  const map = Object.fromEntries(settingRows.map((r) => [r.key, r.value]));

  const initialDisplay = {
    socialShowHeader:
      map.socialShowHeader ?? DEFAULT_SITE_SETTINGS.socialShowHeader,
    socialShowFooter:
      map.socialShowFooter ?? DEFAULT_SITE_SETTINGS.socialShowFooter,
    socialShowSide: map.socialShowSide ?? DEFAULT_SITE_SETTINGS.socialShowSide,
    socialSidePosition:
      map.socialSidePosition ?? DEFAULT_SITE_SETTINGS.socialSidePosition,
    socialClickMode:
      map.socialClickMode ?? DEFAULT_SITE_SETTINGS.socialClickMode,
  };

  return (
    <AdminShell
      title="وسائل التواصل"
      subtitle="إدارة الأيقونات والروابط وأماكن الظهور"
    >
      <AdminContentSubnav active="/admin/content/social" />
      <SocialLinksEditor
        initialLinks={links.map((l) => ({
          id: l.id,
          platform: l.platform,
          label: l.label,
          url: l.url,
          sortOrder: l.sortOrder,
          enabled: l.enabled,
        }))}
        initialDisplay={initialDisplay}
      />
    </AdminShell>
  );
}
