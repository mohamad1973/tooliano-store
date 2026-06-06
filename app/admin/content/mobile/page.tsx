import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { MobileContentHub } from "@/components/admin/cms/MobileContentHub";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { getMobileDisplaySettings } from "@/lib/cms/get-site-content";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "الموبايل" };

export default async function AdminContentMobilePage() {
  await requireAdmin();

  const [
    mobileSettings,
    socialLinks,
    homeSections,
    homeBanners,
    footerColumns,
    clickModeRow,
  ] = await Promise.all([
    getMobileDisplaySettings(),
    prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.homeBanner.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.footerColumn.findMany({
      orderBy: { sortOrder: "asc" },
      include: { links: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.siteSetting.findUnique({
      where: { key: "socialClickMode" },
    }),
  ]);

  const socialClickMode =
    clickModeRow?.value === "direct" ? "direct" : "chooser";

  return (
    <AdminShell
      title="الموبايل"
      subtitle="إعدادات تجربة الموبايل — الهيدر، السوشيال، الأقسام، والفوتر"
    >
      <AdminContentSubnav active="/admin/content/mobile" />
      <MobileContentHub
        mobileSettings={mobileSettings}
        socialLinks={socialLinks.map((l) => ({
          id: l.id,
          platform: l.platform,
          label: l.label,
          url: l.url,
          sortOrder: l.sortOrder,
          enabled: l.enabled,
        }))}
        socialClickMode={socialClickMode}
        homeSections={homeSections}
        homeBanners={homeBanners}
        footerColumns={footerColumns}
      />
    </AdminShell>
  );
}
