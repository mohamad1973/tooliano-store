/**
 * يضيف قالب WP_MEDIA_* إلى .env.local إن لم يكن موجوداً
 * الاستخدام: npm run setup:wp-env
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const BLOCK = `
# --- WordPress Media (نشر صور المنتجات المحلية على tooliano.com) ---
# أنشئ Application Password من: wp-admin → المستخدمون → ملفك الشخصي → Application Passwords
# WP_MEDIA_USER=admin
# WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
`;

function main() {
  const root = process.cwd();
  const envLocal = path.join(root, ".env.local");
  const envExample = path.join(root, "env.example");

  if (!existsSync(envLocal)) {
    if (existsSync(envExample)) {
      copyFileSync(envExample, envLocal);
      console.log("✓ تم إنشاء .env.local من env.example");
    } else {
      writeFileSync(envLocal, BLOCK.trim() + "\n", "utf8");
      console.log("✓ تم إنشاء .env.local");
    }
  }

  const content = readFileSync(envLocal, "utf8");
  if (content.includes("WP_MEDIA_USER") || content.includes("WP_APP_PASSWORD")) {
    console.log("✓ .env.local يحتوي بالفعل على WP_MEDIA_USER / WP_APP_PASSWORD");
    console.log("  عدّل القيم ثم شغّل: npm run check:wp-media");
    return;
  }

  writeFileSync(envLocal, content.trimEnd() + BLOCK, "utf8");
  console.log("✓ أُضيف قالب WP_MEDIA_* إلى .env.local");
  console.log("  1) أزل # من السطرين وضع اسم المستخدم و Application Password");
  console.log("  2) npm run check:wp-media");
  console.log("  3) أعد تشغيل npm run dev");
}

main();
