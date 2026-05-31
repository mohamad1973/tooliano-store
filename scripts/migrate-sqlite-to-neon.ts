/**
 * ترحيل بيانات SQLite المحلية إلى MySQL (Hostinger) أو Postgres (Neon)
 * الاستخدام: npm run migrate:sqlite-to-db
 *
 * المتطلبات في .env.local:
 *   DATABASE_URL = mysql://... أو postgresql://...
 *   SQLITE_PATH = ./prisma/dev.db (اختياري)
 */
import { existsSync } from "fs";
import path from "path";
import Database from "better-sqlite3";
import { PrismaClient } from "@prisma/client";
import {
  assertProductionDatabaseUrl,
  databaseKind,
} from "./lib/assert-database-url";
import { loadEnvLocal, requireEnv } from "./lib/load-env-local";

type SqliteUser = {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

type SqliteVendorProfile = {
  id: string;
  userId: string;
  companyName: string;
  contactName: string;
  phone: string;
  contactEmail: string;
  address: string;
  businessType: string;
  teamSize: number;
  productTypesDescription: string;
  status: string;
  adminNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type SqliteSubmission = {
  id: string;
  vendorId: string;
  productName: string;
  productType: string;
  productCondition: string;
  productDescription: string;
  specWatts: string | null;
  specVoltage: string | null;
  specCapacity: string | null;
  specPower: string | null;
  specColor: string | null;
  specExtra: string | null;
  outletReason: string | null;
  suggestedQuantity: number;
  suggestedRetailPrice: number | null;
  suggestedGroupPrice: number | null;
  productImageUrl: string | null;
  status: string;
  adminNote: string | null;
  reviewedAt: string | null;
  wooProductId: number | null;
  campaignEndsAt: string | null;
  reservedQuantity: number;
  publishedOnStore: number;
  wooSyncStatus: string;
  wooSyncError: string | null;
  idempotencyKey: string | null;
  createdAt: string;
  updatedAt: string;
};

function resolveSqlitePath(): string {
  const fromEnv = process.env.SQLITE_PATH?.trim();
  if (fromEnv) {
    return path.isAbsolute(fromEnv) ? fromEnv : path.join(process.cwd(), fromEnv);
  }
  const candidates = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), "prisma", "prisma", "dev.db"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return candidates[0];
}

function tableExists(db: Database.Database, name: string): boolean {
  const row = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
    )
    .get(name) as { name: string } | undefined;
  return Boolean(row);
}

async function main() {
  loadEnvLocal();

  const databaseUrl = requireEnv("DATABASE_URL");
  assertProductionDatabaseUrl(databaseUrl);
  const kind = databaseKind(databaseUrl);

  const sqlitePath = resolveSqlitePath();
  if (!existsSync(sqlitePath)) {
    console.error(`❌ لم يُعثر على SQLite: ${sqlitePath}`);
    console.error("   شغّل npm run dev محلياً وأنشئ بيانات، أو حدّد SQLITE_PATH في .env.local");
    process.exit(1);
  }

  const targetLabel = kind === "mysql" ? "MySQL (Hostinger)" : "Postgres";
  console.log(`=== ترحيل SQLite → ${targetLabel} ===\n`);
  console.log(`مصدر: ${sqlitePath}`);
  console.log(`هدف:  ${databaseUrl.replace(/:[^:@]+@/, ":****@")}\n`);

  const sqlite = new Database(sqlitePath, { readonly: true });
  const prisma = new PrismaClient();

  try {
    if (!tableExists(sqlite, "User")) {
      throw new Error("جدول User غير موجود في SQLite — هل الملف صحيح؟");
    }

    const users = sqlite.prepare("SELECT * FROM User").all() as SqliteUser[];
    const profiles = tableExists(sqlite, "VendorProfile")
      ? (sqlite.prepare("SELECT * FROM VendorProfile").all() as SqliteVendorProfile[])
      : [];
    const submissions = tableExists(sqlite, "ProductSubmission")
      ? (sqlite
          .prepare("SELECT * FROM ProductSubmission")
          .all() as SqliteSubmission[])
      : [];

    console.log(
      `قراءة: ${users.length} مستخدم، ${profiles.length} ملف تاجر، ${submissions.length} منتج`,
    );

    await prisma.$transaction(async (tx) => {
      for (const u of users) {
        await tx.user.upsert({
          where: { id: u.id },
          create: {
            id: u.id,
            username: u.username,
            passwordHash: u.passwordHash,
            role: u.role,
            phone: u.phone ?? null,
            email: u.email ?? null,
            createdAt: new Date(u.createdAt),
            updatedAt: new Date(u.updatedAt),
          },
          update: {
            username: u.username,
            passwordHash: u.passwordHash,
            role: u.role,
            phone: u.phone ?? null,
            email: u.email ?? null,
            updatedAt: new Date(u.updatedAt),
          },
        });
      }

      for (const p of profiles) {
        await tx.vendorProfile.upsert({
          where: { id: p.id },
          create: {
            id: p.id,
            userId: p.userId,
            companyName: p.companyName,
            contactName: p.contactName,
            phone: p.phone,
            contactEmail: p.contactEmail,
            address: p.address,
            businessType: p.businessType,
            teamSize: p.teamSize,
            productTypesDescription: p.productTypesDescription,
            status: p.status,
            adminNote: p.adminNote,
            reviewedAt: p.reviewedAt ? new Date(p.reviewedAt) : null,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          },
          update: {
            companyName: p.companyName,
            contactName: p.contactName,
            phone: p.phone,
            contactEmail: p.contactEmail,
            address: p.address,
            businessType: p.businessType,
            teamSize: p.teamSize,
            productTypesDescription: p.productTypesDescription,
            status: p.status,
            adminNote: p.adminNote,
            reviewedAt: p.reviewedAt ? new Date(p.reviewedAt) : null,
            updatedAt: new Date(p.updatedAt),
          },
        });
      }

      for (const s of submissions) {
        await tx.productSubmission.upsert({
          where: { id: s.id },
          create: {
            id: s.id,
            vendorId: s.vendorId,
            productName: s.productName,
            productType: s.productType,
            productCondition: s.productCondition ?? "NEW",
            productDescription: s.productDescription ?? "",
            specWatts: s.specWatts,
            specVoltage: s.specVoltage,
            specCapacity: s.specCapacity,
            specPower: s.specPower,
            specColor: s.specColor,
            specExtra: s.specExtra,
            outletReason: s.outletReason,
            suggestedQuantity: s.suggestedQuantity,
            suggestedRetailPrice: s.suggestedRetailPrice,
            suggestedGroupPrice: s.suggestedGroupPrice,
            productImageUrl: s.productImageUrl,
            status: s.status,
            adminNote: s.adminNote,
            reviewedAt: s.reviewedAt ? new Date(s.reviewedAt) : null,
            wooProductId: s.wooProductId,
            campaignEndsAt: s.campaignEndsAt
              ? new Date(s.campaignEndsAt)
              : null,
            reservedQuantity: s.reservedQuantity ?? 0,
            publishedOnStore: Boolean(s.publishedOnStore),
            wooSyncStatus: s.wooSyncStatus ?? "none",
            wooSyncError: s.wooSyncError,
            idempotencyKey: s.idempotencyKey,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          },
          update: {
            productName: s.productName,
            productType: s.productType,
            productCondition: s.productCondition ?? "NEW",
            productDescription: s.productDescription ?? "",
            specWatts: s.specWatts,
            specVoltage: s.specVoltage,
            specCapacity: s.specCapacity,
            specPower: s.specPower,
            specColor: s.specColor,
            specExtra: s.specExtra,
            outletReason: s.outletReason,
            suggestedQuantity: s.suggestedQuantity,
            suggestedRetailPrice: s.suggestedRetailPrice,
            suggestedGroupPrice: s.suggestedGroupPrice,
            productImageUrl: s.productImageUrl,
            status: s.status,
            adminNote: s.adminNote,
            reviewedAt: s.reviewedAt ? new Date(s.reviewedAt) : null,
            wooProductId: s.wooProductId,
            campaignEndsAt: s.campaignEndsAt
              ? new Date(s.campaignEndsAt)
              : null,
            reservedQuantity: s.reservedQuantity ?? 0,
            publishedOnStore: Boolean(s.publishedOnStore),
            wooSyncStatus: s.wooSyncStatus ?? "none",
            wooSyncError: s.wooSyncError,
            idempotencyKey: s.idempotencyKey,
            updatedAt: new Date(s.updatedAt),
          },
        });
      }
    }, { maxWait: 60000, timeout: 120000 });

    const now = new Date();
    const active = await prisma.productSubmission.count({
      where: {
        status: "APPROVED",
        publishedOnStore: true,
        campaignEndsAt: { gt: now },
        suggestedRetailPrice: { not: null },
        suggestedGroupPrice: { not: null },
      },
    });

    const approved = await prisma.productSubmission.count({
      where: { status: "APPROVED" },
    });

    console.log("\n✅ اكتمل الترحيل");
    console.log(`   منتجات معتمدة: ${approved}`);
    console.log(`   فرص شراء جماعي نشطة (تظهر في الرئيسية): ${active}`);

    if (
      active === 0 &&
      approved > 0 &&
      process.env.EXTEND_EXPIRED_CAMPAIGNS !== "false"
    ) {
      const days = Number(process.env.DEFAULT_CAMPAIGN_DAYS ?? "7");
      const ends = new Date();
      ends.setDate(ends.getDate() + days);
      const extended = await prisma.productSubmission.updateMany({
        where: {
          status: "APPROVED",
          publishedOnStore: true,
          OR: [{ campaignEndsAt: null }, { campaignEndsAt: { lte: now } }],
        },
        data: { campaignEndsAt: ends },
      });
      if (extended.count > 0) {
        console.log(
          `\n📅 مُدّدت ${extended.count} حملة منتهية حتى ${ends.toISOString()} (DEFAULT_CAMPAIGN_DAYS=${days})`,
        );
        console.log(
          "   لتعطيل التمديد التلقائي: EXTEND_EXPIRED_CAMPAIGNS=false",
        );
      }
    } else if (active === 0 && approved > 0) {
      console.log(
        "\n⚠️  لا توجد حملات نشطة — campaignEndsAt منتهية. شغّل: npm run extend:campaigns",
      );
    }

    console.log("\nالخطوة التالية: npm run migrate:vendor-images");
    console.log("ثم Redeploy على Vercel.");
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
