/**
 * إصلاح قاعدة الإنتاج: ظهور المعتمدة + تواريخ انتهاء + تمديد المنتهية
 * يعمل على Vercel (DATABASE_URL) أو محلياً (.env.local)
 */
import { PrismaClient } from "@prisma/client";
import { loadEnvLocal, requireEnv } from "./lib/load-env-local";
import {
  APPROVAL_STATUS,
  CAMPAIGN_OUTCOME,
  DEFAULT_CAMPAIGN_DAYS,
} from "../lib/db/constants";
import { DEFAULT_HOME_BANNERS, DEFAULT_NAV_MENU } from "../lib/cms/defaults";

function computeCampaignEndsAt(row: {
  dealDurationDays: number;
  dealDurationHours: number;
  dealDurationMinutes: number;
}): Date {
  const campaignEndsAt = new Date();
  const durationMinutes =
    row.dealDurationDays * 24 * 60 +
    row.dealDurationHours * 60 +
    row.dealDurationMinutes;
  if (Number.isFinite(durationMinutes) && durationMinutes > 0) {
    campaignEndsAt.setMinutes(campaignEndsAt.getMinutes() + durationMinutes);
  } else {
    campaignEndsAt.setDate(campaignEndsAt.getDate() + DEFAULT_CAMPAIGN_DAYS);
  }
  return campaignEndsAt;
}

async function main() {
  loadEnvLocal();
  requireEnv("DATABASE_URL");

  const prisma = new PrismaClient();
  const now = new Date();

  try {
    await prisma.$queryRaw`SELECT 1`;

    let menuUpserts = 0;
    for (const [sortOrder, item] of DEFAULT_NAV_MENU.entries()) {
      const existing = await prisma.navMenuItem.findFirst({
        where: { label: item.label },
        select: { id: true },
      });
      const data = {
        label: item.label,
        href: item.href,
        linkType: item.linkType,
        categorySlug: "categorySlug" in item ? item.categorySlug : null,
        sortOrder,
        enabled: true,
      };
      if (existing) {
        await prisma.navMenuItem.update({ where: { id: existing.id }, data });
      } else {
        await prisma.navMenuItem.create({ data });
      }
      menuUpserts++;
    }

    let bannerUpserts = 0;
    for (const banner of DEFAULT_HOME_BANNERS) {
      const existing = await prisma.homeBanner.findFirst({
        where: {
          title: banner.title,
          placement: banner.placement,
        },
        select: { id: true },
      });
      const data = {
        imageUrl: banner.imageUrl,
        categorySlug: banner.categorySlug,
        title: banner.title,
        placement: banner.placement,
        href: banner.href,
        altText: banner.altText,
        sortOrder: banner.sortOrder,
        enabled: true,
      };
      if (existing) {
        await prisma.homeBanner.update({ where: { id: existing.id }, data });
      } else {
        await prisma.homeBanner.create({ data });
      }
      bannerUpserts++;
    }

    const published = await prisma.productSubmission.updateMany({
      where: {
        status: APPROVAL_STATUS.APPROVED,
        adminHidden: false,
        publishedOnStore: false,
      },
      data: { publishedOnStore: true },
    });

    const missingEnds = await prisma.productSubmission.findMany({
      where: {
        status: APPROVAL_STATUS.APPROVED,
        adminHidden: false,
        campaignEndsAt: null,
      },
      select: {
        id: true,
        dealDurationDays: true,
        dealDurationHours: true,
        dealDurationMinutes: true,
      },
    });

    for (const row of missingEnds) {
      await prisma.productSubmission.update({
        where: { id: row.id },
        data: {
          campaignEndsAt: computeCampaignEndsAt(row),
          campaignOutcome: CAMPAIGN_OUTCOME.ACTIVE,
          publishedOnStore: true,
        },
      });
    }

    const extendEnds = new Date();
    extendEnds.setDate(extendEnds.getDate() + 1);

    const expired = await prisma.productSubmission.findMany({
      where: {
        status: APPROVAL_STATUS.APPROVED,
        campaignOutcome: {
          in: [CAMPAIGN_OUTCOME.ACTIVE, CAMPAIGN_OUTCOME.AWAITING_DECISION],
        },
        campaignEndsAt: { lte: now },
      },
      select: {
        id: true,
        suggestedQuantity: true,
        reservedQuantity: true,
        adminHidden: true,
      },
    });

    let extended = 0;
    let succeeded = 0;

    for (const sub of expired) {
      if (sub.reservedQuantity >= sub.suggestedQuantity) {
        await prisma.productSubmission.update({
          where: { id: sub.id },
          data: { campaignOutcome: CAMPAIGN_OUTCOME.SUCCEEDED },
        });
        succeeded++;
      } else {
        await prisma.productSubmission.update({
          where: { id: sub.id },
          data: {
            campaignEndsAt: extendEnds,
            campaignOutcome: CAMPAIGN_OUTCOME.ACTIVE,
            ...(!sub.adminHidden ? { publishedOnStore: true } : {}),
          },
        });
        extended++;
      }
    }

    const visible = await prisma.productSubmission.count({
      where: {
        status: APPROVAL_STATUS.APPROVED,
        adminHidden: false,
        suggestedRetailPrice: { not: null },
        suggestedGroupPrice: { not: null },
        campaignEndsAt: { not: null },
      },
    });

    console.log("=== إصلاح متجر الشراء الجماعي ===");
    console.log(`عناصر المنيو ضُبطت: ${menuUpserts}`);
    console.log(`بنرات الواجهة ضُبطت: ${bannerUpserts}`);
    console.log(`publishedOnStore أُصلح: ${published.count}`);
    console.log(`campaignEndsAt أُضيف: ${missingEnds.length}`);
    console.log(`تمديد تلقائي: ${extended} | نجاح كمية: ${succeeded}`);
    console.log(`معتمدة جاهزة للعرض الآن: ${visible}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
