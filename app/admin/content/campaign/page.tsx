import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { CampaignContentEditors } from "@/components/admin/cms/CampaignContentEditors";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import {
  CONTENT_BLOCK_SLUGS,
  DEFAULT_FAQ,
  DEFAULT_HOW_IT_WORKS,
  DEFAULT_WALLET_POLICY,
} from "@/lib/cms/defaults";
import type {
  FaqContent,
  HowItWorksContent,
  WalletPolicyContent,
} from "@/lib/cms/types";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "محتوى الحملة" };

async function loadFaq(): Promise<FaqContent> {
  const row = await prisma.contentBlock.findUnique({
    where: { slug: CONTENT_BLOCK_SLUGS.FAQ },
  });
  if (!row) return DEFAULT_FAQ;
  try {
    const data = JSON.parse(row.body) as FaqContent;
    return { title: row.title, items: data.items ?? DEFAULT_FAQ.items };
  } catch {
    return DEFAULT_FAQ;
  }
}

async function loadHowItWorks(): Promise<HowItWorksContent> {
  const row = await prisma.contentBlock.findUnique({
    where: { slug: CONTENT_BLOCK_SLUGS.HOW_IT_WORKS },
  });
  if (!row) return DEFAULT_HOW_IT_WORKS;
  try {
    const data = JSON.parse(row.body) as HowItWorksContent;
    return {
      title: row.title,
      steps: data.steps ?? DEFAULT_HOW_IT_WORKS.steps,
    };
  } catch {
    return DEFAULT_HOW_IT_WORKS;
  }
}

async function loadWallet(): Promise<WalletPolicyContent> {
  const row = await prisma.contentBlock.findUnique({
    where: { slug: CONTENT_BLOCK_SLUGS.WALLET_POLICY },
  });
  if (!row) return DEFAULT_WALLET_POLICY;
  try {
    const data = JSON.parse(row.body) as WalletPolicyContent;
    return {
      title: row.title,
      intro: data.intro ?? DEFAULT_WALLET_POLICY.intro,
      options: data.options ?? DEFAULT_WALLET_POLICY.options,
    };
  } catch {
    return DEFAULT_WALLET_POLICY;
  }
}

export default async function AdminContentCampaignPage() {
  await requireAdmin();

  const [faq, howItWorks, walletPolicy] = await Promise.all([
    loadFaq(),
    loadHowItWorks(),
    loadWallet(),
  ]);

  return (
    <AdminShell title="صفحات الحملة" subtitle="محرر مرئي — بدون JSON يدوي">
      <AdminContentSubnav active="/admin/content/campaign" />
      <CampaignContentEditors
        faq={faq}
        howItWorks={howItWorks}
        walletPolicy={walletPolicy}
      />
    </AdminShell>
  );
}
