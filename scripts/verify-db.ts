/**
 * التحقق من اتصال قاعدة الإنتاج وعدد فرص الشراء الجماعي النشطة
 * الاستخدام: npm run verify:db
 */
import { PrismaClient } from "@prisma/client";
import {
  assertProductionDatabaseUrl,
  databaseKind,
} from "./lib/assert-database-url";
import { loadEnvLocal, requireEnv } from "./lib/load-env-local";

async function main() {
  loadEnvLocal();
  const url = requireEnv("DATABASE_URL");
  assertProductionDatabaseUrl(url);

  const kind = databaseKind(url);
  const prisma = new PrismaClient();
  const now = new Date();

  try {
    await prisma.$queryRaw`SELECT 1`;

    const [users, vendors, submissions, active] = await Promise.all([
      prisma.user.count(),
      prisma.vendorProfile.count(),
      prisma.productSubmission.count(),
      prisma.productSubmission.count({
        where: {
          status: "APPROVED",
          publishedOnStore: true,
          campaignEndsAt: { gt: now },
          suggestedRetailPrice: { not: null },
          suggestedGroupPrice: { not: null },
        },
      }),
    ]);

    const label = kind === "mysql" ? "MySQL (Hostinger)" : "Postgres";
    console.log(`=== تحقق قاعدة ${label} ===\n`);
    console.log(`✅ اتصال ناجح`);
    console.log(`   مستخدمون: ${users}`);
    console.log(`   ملفات تجار: ${vendors}`);
    console.log(`   طلبات منتجات: ${submissions}`);
    console.log(`   فرص شراء جماعي نشطة: ${active}`);

    if (active === 0) {
      console.log(
        "\n⚠️  الرئيسية ستعرض «لا توجد فرص نشطة» حتى تُوافق منتجات أو تُمدَّد campaignEndsAt.",
      );
      console.log("   جرّب: npm run extend:campaigns");
      process.exit(0);
    }

    console.log("\n✅ جاهز لعرض الشراء الجماعي على Vercel بعد Redeploy.");
  } catch (e) {
    console.error("❌ فشل الاتصال:", e instanceof Error ? e.message : e);
    console.error("   راجع docs/DEPLOY-HOSTINGER-MYSQL.md (Remote MySQL + DATABASE_URL)");
    console.error("   ثم: npm run db:setup");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
