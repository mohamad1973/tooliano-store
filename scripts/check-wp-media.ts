/**
 * تحقق من إعداد رفع الوسائط إلى WordPress
 * الاستخدام: npm run check:wp-media
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import axios from "axios";

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

function normalizeWpAppPassword(raw: string | undefined): string {
  return (raw ?? "").replace(/\s+/g, "").trim();
}

async function main() {
  loadEnvLocal();

  const baseURL = process.env.WC_BASE_URL?.replace(/\/$/, "");
  const user = (
    process.env.WP_MEDIA_USER ?? process.env.WP_MEDIA_USERNAME ?? ""
  ).trim();
  const appPassword = normalizeWpAppPassword(process.env.WP_APP_PASSWORD);

  console.log("=== فحص إعداد WordPress Media ===\n");

  if (!baseURL) {
    console.error("❌ WC_BASE_URL غير مضبوط في .env.local");
    process.exit(1);
  }
  console.log(`✓ WC_BASE_URL = ${baseURL}`);

  if (!user || !appPassword) {
    console.error("\n❌ WP_MEDIA_USER أو WP_APP_PASSWORD غير مضبوطين");
    console.error("   راجع: docs/WORDPRESS-MEDIA-SETUP.md");
    process.exit(1);
  }
  console.log(`✓ WP_MEDIA_USER = ${user}`);
  console.log("✓ WP_APP_PASSWORD = (مضبوط)");

  const meUrl = new URL("/wp-json/wp/v2/users/me", `${baseURL}/`).toString();
  const token = Buffer.from(`${user}:${appPassword}`).toString("base64");

  const res = await axios.get(meUrl, {
    headers: { Authorization: `Basic ${token}` },
    validateStatus: () => true,
    timeout: 20_000,
  });

  if (res.status === 200) {
    console.log("\n✅ اتصال WordPress ناجح — يمكنك «نشر على WordPress» من لوحة الأدمن.");
    process.exit(0);
  }

  const detail =
    typeof res.data === "object" && res.data?.message
      ? res.data.message
      : `HTTP ${res.status}`;
  console.error(`\n❌ فشل التحقق: ${detail}`);
  console.error("   تأكد من Application Password وحساب مدير.");
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
