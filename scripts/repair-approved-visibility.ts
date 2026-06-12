/**
 * إصلاح ظهور المنتجات المعتمدة: publishedOnStore=true للمعتمدة غير المخفية إدارياً
 * الاستخدام: npm run repair:approved-visibility
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

  const prisma = new PrismaClient();
  const kind = databaseKind(url);

  try {
    const beforeUnpublished = await prisma.productSubmission.count({
      where: {
        status: APPROVAL_STATUS.APPROVED,
        adminHidden: false,
        publishedOnStore: false,
      },
    });

    const repaired = await prisma.productSubmission.updateMany({
      where: {
        status: APPROVAL_STATUS.APPROVED,
        adminHidden: false,
        publishedOnStore: false,
      },
      data: { publishedOnStore: true },
    });

    const [adminHidden, visibleOnStore] = await Promise.all([
      prisma.productSubmission.count({
        where: {
          status: APPROVAL_STATUS.APPROVED,
          adminHidden: true,
        },
      }),
      prisma.productSubmission.count({
        where: {
          status: APPROVAL_STATUS.APPROVED,
          publishedOnStore: true,
          adminHidden: false,
        },
      }),
    ]);

    console.log(`=== إصلاح ظهور المنتجات المعتمدة (${kind}) ===\n`);
    console.log(`معتمدة ومخفية إدارياً: ${adminHidden}`);
    console.log(`معتمدة غير منشورة قبل الإصلاح: ${beforeUnpublished}`);
    console.log(`تم إصلاح publishedOnStore: ${repaired.count}`);
    console.log(`معتمدة ظاهرة على المتجر الآن: ${visibleOnStore}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
