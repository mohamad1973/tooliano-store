import type { PrismaClient } from "@prisma/client";
import {
  CONTENT_BLOCK_SLUGS,
  DEFAULT_FAQ,
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_HOME_BANNERS,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_HOW_IT_WORKS,
  DEFAULT_MARQUEE_PHRASES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_WALLET_POLICY,
} from "../lib/cms/defaults";

export async function seedCms(prisma: PrismaClient) {
  const settingCount = await prisma.siteSetting.count();
  if (settingCount === 0) {
    await prisma.siteSetting.createMany({
      data: Object.entries(DEFAULT_SITE_SETTINGS).map(([key, value]) => ({
        key,
        value,
      })),
    });
    console.log("CMS: site settings seeded");
  }

  const marqueeCount = await prisma.marqueeItem.count();
  if (marqueeCount === 0) {
    await prisma.marqueeItem.createMany({
      data: DEFAULT_MARQUEE_PHRASES.map((text, sortOrder) => ({
        text,
        sortOrder,
        enabled: true,
      })),
    });
    console.log("CMS: marquee items seeded");
  }

  const bannerCount = await prisma.homeBanner.count();
  if (bannerCount === 0) {
    await prisma.homeBanner.createMany({
      data: DEFAULT_HOME_BANNERS.map((b) => ({
        imageUrl: b.imageUrl,
        categorySlug: b.categorySlug,
        title: b.title,
        sortOrder: b.sortOrder,
        enabled: true,
      })),
    });
    console.log("CMS: home banners seeded");
  }

  const sectionCount = await prisma.homeSection.count();
  if (sectionCount === 0) {
    await prisma.homeSection.createMany({
      data: DEFAULT_HOME_SECTIONS.map((s) => ({
        key: s.key,
        label: s.label,
        sortOrder: s.sortOrder,
        visible: true,
      })),
    });
    console.log("CMS: home sections seeded");
  }

  const blocks: { slug: string; title: string; body: object }[] = [
    {
      slug: CONTENT_BLOCK_SLUGS.FAQ,
      title: DEFAULT_FAQ.title,
      body: DEFAULT_FAQ,
    },
    {
      slug: CONTENT_BLOCK_SLUGS.HOW_IT_WORKS,
      title: DEFAULT_HOW_IT_WORKS.title,
      body: DEFAULT_HOW_IT_WORKS,
    },
    {
      slug: CONTENT_BLOCK_SLUGS.WALLET_POLICY,
      title: DEFAULT_WALLET_POLICY.title,
      body: DEFAULT_WALLET_POLICY,
    },
  ];

  for (const block of blocks) {
    const exists = await prisma.contentBlock.findUnique({
      where: { slug: block.slug },
    });
    if (!exists) {
      await prisma.contentBlock.create({
        data: {
          slug: block.slug,
          title: block.title,
          body: JSON.stringify(block.body),
        },
      });
      console.log("CMS: content block seeded:", block.slug);
    }
  }

  const footerCount = await prisma.footerColumn.count();
  if (footerCount === 0) {
    for (const col of DEFAULT_FOOTER_COLUMNS) {
      await prisma.footerColumn.create({
        data: {
          title: col.title,
          sortOrder: col.sortOrder,
          links: {
            create: col.links.map((l) => ({
              label: l.label,
              href: l.href,
              sortOrder: l.sortOrder,
              external: l.external,
            })),
          },
        },
      });
    }
    console.log("CMS: footer seeded");
  }
}
