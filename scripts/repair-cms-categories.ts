/**
 * إصلاح ومزامنة روابط التصنيفات في CMS (منيو + بنرات).
 * الاستخدام: npm run cms:repair-categories
 */
import { loadEnvLocal, requireEnv } from "./lib/load-env-local";

async function main() {
  loadEnvLocal();
  requireEnv("DATABASE_URL");
  requireEnv("WC_BASE_URL");
  requireEnv("WC_CONSUMER_KEY");
  requireEnv("WC_CONSUMER_SECRET");

  const { syncWooCategoriesToCms } = await import("../lib/cms/sync-woo-categories");
  const result = await syncWooCategoriesToCms();
  console.log("✅ تمت مزامنة التصنيفات:", JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
