/**
 * رفع صور /uploads/vendors المحلية إلى WordPress وتحديث productImageUrl في Neon
 * الاستخدام: npm run migrate:vendor-images
 */
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  isVendorLocalImagePath,
  normalizeProductImageSrc,
  VENDOR_UPLOAD_PATH_PREFIX,
} from "@/lib/product-image-src";
import { isWordPressMediaUploadConfigured } from "@/lib/wp-media-config-shared";
import { uploadToWordPressMedia } from "@/lib/wp-upload-media-shared";
import { loadEnvLocal, requireEnv } from "./lib/load-env-local";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function uploadLocalPath(localPath: string): Promise<string> {
  const relative = localPath.replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", relative);
  if (!existsSync(filePath)) {
    throw new Error(`الملف غير موجود: ${filePath}`);
  }
  const ext = path.extname(filePath).toLowerCase();
  const buffer = await readFile(filePath);
  return uploadToWordPressMedia({
    buffer,
    mimeType: MIME_BY_EXT[ext] ?? "image/jpeg",
    filename: path.basename(filePath),
  });
}

async function main() {
  loadEnvLocal();
  requireEnv("DATABASE_URL");

  if (!isWordPressMediaUploadConfigured()) {
    console.error("❌ WP_MEDIA_USER و WP_APP_PASSWORD مطلوبان — راجع docs/WORDPRESS-MEDIA-SETUP.md");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const rows = await prisma.productSubmission.findMany({
      where: { productImageUrl: { not: null } },
      select: { id: true, productName: true, productImageUrl: true },
    });

    const toFix = rows.filter(
      (r) => r.productImageUrl && isVendorLocalImagePath(r.productImageUrl),
    );

    console.log(`=== رفع صور الفيندور إلى WordPress ===\n`);
    console.log(`منتجات بصور محلية: ${toFix.length}\n`);

    let ok = 0;
    let fail = 0;

    for (const row of toFix) {
      const normalized = normalizeProductImageSrc(row.productImageUrl);
      if (!normalized?.startsWith(VENDOR_UPLOAD_PATH_PREFIX)) {
        console.log(`⏭  ${row.productName}: تخطي (مسار غير معروف)`);
        continue;
      }

      try {
        const wpUrl = await uploadLocalPath(normalized);
        await prisma.productSubmission.update({
          where: { id: row.id },
          data: { productImageUrl: wpUrl },
        });
        console.log(`✅ ${row.productName}`);
        console.log(`   → ${wpUrl}`);
        ok++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`❌ ${row.productName}: ${msg}`);
        fail++;
      }
    }

    console.log(`\nتم: ${ok} ناجح، ${fail} فشل`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
