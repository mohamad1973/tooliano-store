/**
 * التحقق من اتصال قاعدة الإنتاج وعدد العروض المعتمدة الظاهرة على المتجر
 * الاستخدام: npm run verify:db
 */
import { PrismaClient } from "@prisma/client";
import {
  assertProductionDatabaseUrl,
  databaseKind,
} from "./lib/assert-database-url";
import { loadEnvLocal, requireEnv } from "./lib/load-env-local";
import { APPROVAL_STATUS } from "../lib/db/constants";

async function main() {
  loadEnvLocal();
  const url = requireEnv("DATABASE_URL");
  assertProductionDatabaseUrl(url);

  const kind = databaseKind(url);
  const prisma = new PrismaClient();
  const now = new Date();

  try {
    await prisma.$queryRaw`SELECT 1`;

    const [users, vendors, submissions, visibleApproved, activeTime] =
      await Promise.all([
        prisma.user.count(),
        prisma.vendorProfile.count(),
        prisma.productSubmission.count(),
        prisma.productSubmission.count({
          where: {
            status: APPROVAL_STATUS.APPROVED,
            publishedOnStore: true,
            adminHidden: false,
            suggestedRetailPrice: { not: null },
            suggestedGroupPrice: { not: null },
            campaignEndsAt: { not: null },
          },
        }),
        prisma.productSubmission.count({
          where: {
            status: APPROVAL_STATUS.APPROVED,
            publishedOnStore: true,
            adminHidden: false,
            campaignOutcome: "ACTIVE",
            campaignEndsAt: { gt: now },
          },
        }),
      ]);

    const label = kind === "mysql" ? "MySQL (Hostinger)" : "Postgres";
    console.log(`=== تحقق قاعدة ${label} ===\n`);
    console.log(`✅ اتصال ناجح`);
    console.log(`   مستخدمون: ${users}`);
    console.log(`   ملفات تجار: ${vendors}`);
    console.log(`   طلبات منتجات: ${submissions}`);
    console.log(`   عروض معتمدة ظاهرة على المتجر: ${visibleApproved}`);
    console.log(`   منها نشطة زمنياً (ACTIVE + لم تنتهِ): ${activeTime}`);

    if (visibleApproved === 0) {
      console.log(
        "\n⚠️  الرئيسية ستعرض «لا توجد عروض معتمدة» — راجع موافقات الأدمن أو publishedOnStore.",
      );
      console.log("   جرّب: npm run repair:approved-visibility");
      process.exit(0);
    }

    console.log(
      "\n✅ المنتجات المعتمدة تظهر حتى بعد انتهاء المدة (بشارة حالة).",
    );
  } catch (e) {
    console.error("❌ فشل الاتصال:", e instanceof Error ? e.message : e);
    console.error(
      "   راجع docs/DEPLOY-HOSTINGER-MYSQL.md (Remote MySQL + DATABASE_URL)",
    );
    console.error("   ثم: npm run db:setup");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
