/**
 * تحقق من إعداد رفع الوسائط إلى WordPress (دخول + رفع تجريبي)
 * الاستخدام: npm run check:wp-media
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import {
  resolveWordPressBaseUrl,
  resolveWordPressMediaUsername,
} from "../lib/wp-media-config-shared";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ لم يُعثر على .env.local");
    console.error("   انسخ env.example إلى .env.local ثم أضف المفاتيح.");
    process.exit(1);
  }
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  loadEnvLocal();

  const baseURL = resolveWordPressBaseUrl();
  const user = resolveWordPressMediaUsername();

  console.log("=== فحص إعداد WordPress Media ===\n");

  if (!baseURL) {
    console.error("❌ WP_URL أو WC_BASE_URL غير مضبوط في .env.local");
    process.exit(1);
  }
  console.log(`✓ WP_URL = ${baseURL}`);

  if (!user || !process.env.WP_APP_PASSWORD?.trim()) {
    console.error("\n❌ WP_USERNAME (أو WP_MEDIA_USER) أو WP_APP_PASSWORD غير مضبوطين");
    console.error("   راجع: docs/WORDPRESS-MEDIA-SETUP.md");
    process.exit(1);
  }
  console.log(`✓ WP_USERNAME = ${user}`);
  console.log("✓ WP_APP_PASSWORD = (مضبوط)\n");

  const { getWordPressMediaFullStatus } = await import(
    "../lib/wp-media-verify-shared"
  );
  const status = await getWordPressMediaFullStatus();

  if (status.authOk && status.canUploadMedia) {
    console.log(`✅ ${status.message}`);
    console.log(
      "\nيمكنك رفع الصور عبر POST /api/upload من لوحة التاجر أو الأدمن.",
    );
    process.exit(0);
  }

  console.error(`❌ ${status.message}`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
