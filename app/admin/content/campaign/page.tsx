import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { ContentBlockEditor } from "@/components/admin/cms/ContentBlockEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import {
  CONTENT_BLOCK_SLUGS,
  DEFAULT_FAQ,
  DEFAULT_HOW_IT_WORKS,
  DEFAULT_WALLET_POLICY,
} from "@/lib/cms/defaults";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "محتوى الحملة" };

async function loadBlock(slug: string, fallback: object) {
  const row = await prisma.contentBlock.findUnique({ where: { slug } });
  if (!row) {
    return {
      title: (fallback as { title?: string }).title ?? slug,
      body: JSON.stringify(fallback, null, 2),
    };
  }
  return { title: row.title, body: row.body };
}

export default async function AdminContentCampaignPage() {
  await requireAdmin();

  const [faq, howItWorks, wallet] = await Promise.all([
    loadBlock(CONTENT_BLOCK_SLUGS.FAQ, DEFAULT_FAQ),
    loadBlock(CONTENT_BLOCK_SLUGS.HOW_IT_WORKS, DEFAULT_HOW_IT_WORKS),
    loadBlock(CONTENT_BLOCK_SLUGS.WALLET_POLICY, DEFAULT_WALLET_POLICY),
  ]);

  return (
    <AdminShell title="صفحات الحملة" subtitle="FAQ وكيف يعمل وسياسة المحفظة">
      <AdminContentSubnav active="/admin/content/campaign" />
      <p className="mb-6 text-sm text-brand-navy/70">
        عدّل JSON بحذر. بعد الحفظ يُحدَّث الموقع خلال ثوانٍ.
      </p>
      <ContentBlockEditor
        slug={CONTENT_BLOCK_SLUGS.FAQ}
        label="أسئلة شائعة"
        initialTitle={faq.title}
        initialBody={faq.body}
      />
      <ContentBlockEditor
        slug={CONTENT_BLOCK_SLUGS.HOW_IT_WORKS}
        label="كيف يعمل"
        initialTitle={howItWorks.title}
        initialBody={howItWorks.body}
      />
      <ContentBlockEditor
        slug={CONTENT_BLOCK_SLUGS.WALLET_POLICY}
        label="سياسة المحفظة"
        initialTitle={wallet.title}
        initialBody={wallet.body}
      />
    </AdminShell>
  );
}
