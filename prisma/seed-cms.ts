import type { PrismaClient } from "@prisma/client";
import {
  CONTENT_BLOCK_SLUGS,
  DEFAULT_FAQ,
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_HOME_BANNERS,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_HOW_IT_WORKS,
  DEFAULT_MARQUEE_PHRASES,
  DEFAULT_NAV_MENU,
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

  const navCount = await prisma.navMenuItem.count();
  if (navCount === 0) {
    await prisma.navMenuItem.createMany({
      data: DEFAULT_NAV_MENU.map((item, sortOrder) => ({
        label: item.label,
        href: item.href,
        linkType: item.linkType,
        categorySlug: null,
        sortOrder,
        enabled: true,
      })),
    });
    console.log("CMS: nav menu seeded");
  }

  const blockCount = await prisma.pageBlock.count({
    where: { pageKey: "home" },
  });
  if (blockCount === 0) {
    await prisma.pageBlock.create({
      data: {
        pageKey: "home",
        type: "hero",
        sortOrder: 0,
        payload: JSON.stringify({
          title: "عروض شراء جماعي على Tooliano",
          subtitle: "وفّر أكثر عند الشراء معاً",
          buttonLabel: "تصفّح الفرص",
          buttonHref: "/campaign",
        }),
        enabled: true,
      },
    });
    console.log("CMS: default home hero block seeded");
  }

  const { SOCIAL_URLS } = await import("../lib/constants");
  const socialCount = await prisma.socialLink.count();
  if (socialCount === 0) {
    await prisma.socialLink.createMany({
      data: [
        {
          platform: "facebook",
          label: "فيسبوك",
          url: SOCIAL_URLS.facebook,
          sortOrder: 0,
        },
        {
          platform: "instagram",
          label: "إنستغرام",
          url: SOCIAL_URLS.instagram,
          sortOrder: 1,
        },
        {
          platform: "tiktok",
          label: "تيك توك",
          url: SOCIAL_URLS.tiktok,
          sortOrder: 2,
        },
        {
          platform: "youtube",
          label: "يوتيوب",
          url: SOCIAL_URLS.youtube,
          sortOrder: 3,
        },
      ],
    });
    console.log("CMS: social links seeded");
  }

  for (const [key, value] of Object.entries({
    socialShowHeader: "true",
    socialShowFooter: "false",
    socialShowSide: "false",
    socialSidePosition: "start",
    socialClickMode: "chooser",
    mobileNavMode: "burger",
    mobileDrawerSide: "start",
    mobileShowMarquee: "true",
    mobileShowTagline: "false",
    mobileSocialShowFooter: "true",
    mobileSocialShowHeader: "false",
    mobileFooterCompact: "true",
    mobileFooterShowColumns: "true",
  })) {
    const exists = await prisma.siteSetting.findUnique({ where: { key } });
    if (!exists) {
      await prisma.siteSetting.create({ data: { key, value } });
    }
  }
}
