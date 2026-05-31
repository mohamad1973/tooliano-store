/**
 * اختبار اتصال MySQL من MYSQL_* في .env.local
 * npm run test:mysql
 */
import { PrismaClient } from "@prisma/client";
import { loadEnvLocal } from "./lib/load-env-local";

async function main() {
  loadEnvLocal();
  const host = process.env.MYSQL_HOST?.trim();
  if (!host) {
    console.error("❌ MYSQL_HOST فارغ — املأه من hPanel ثم npm run env:sync-db-url");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    console.log(`✅ اتصال ناجح بـ ${host}`);
  } catch (e) {
    console.error("❌ فشل الاتصال:", e instanceof Error ? e.message : e);
    console.error("   تحقق: Remote MySQL (%), MYSQL_HOST, MYSQL_PASSWORD");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
