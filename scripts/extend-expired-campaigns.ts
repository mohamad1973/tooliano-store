/**
 * تمديد campaignEndsAt للمنتجات المعتمدة المنتهية
 * الاستخدام: npm run extend:campaigns
 */
import { PrismaClient } from "@prisma/client";
import { loadEnvLocal, requireEnv } from "./lib/load-env-local";

async function main() {
  loadEnvLocal();
  requireEnv("DATABASE_URL");

  const days = Number(process.env.DEFAULT_CAMPAIGN_DAYS ?? "7");
  const prisma = new PrismaClient();
  const now = new Date();
  const ends = new Date();
  ends.setDate(ends.getDate() + days);

  try {
    const result = await prisma.productSubmission.updateMany({
      where: {
        status: "APPROVED",
        publishedOnStore: true,
        OR: [{ campaignEndsAt: null }, { campaignEndsAt: { lte: now } }],
      },
      data: { campaignEndsAt: ends },
    });
    console.log(`✅ مُدّدت ${result.count} حملة حتى ${ends.toISOString()}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
