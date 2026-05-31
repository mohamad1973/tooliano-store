/**
 * البحث عن ملفات SQLite في المشروع
 * الاستخدام: npm run locate:dev-db
 */
import { existsSync } from "fs";
import { readdirSync, statSync } from "fs";
import path from "path";

function walk(dir: string, results: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next") continue;
    const full = path.join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walk(full, results);
    } else if (name.endsWith(".db")) {
      results.push(full);
    }
  }
}

function main() {
  const root = process.cwd();
  const defaultPath = path.join(root, "prisma", "dev.db");
  const nestedPath = path.join(root, "prisma", "prisma", "dev.db");
  const found: string[] = [];
  walk(root, found);

  console.log("=== البحث عن قواعد SQLite ===\n");
  console.log(`المسار الافتراضي: ${defaultPath}`);
  console.log(
    existsSync(defaultPath)
      ? "✅ موجود"
      : "❌ غير موجود",
  );
  if (existsSync(nestedPath)) {
    console.log(`\n⚠️  وُجدت قاعدة في مسار متداخل (شائع بعد db push خاطئ):`);
    console.log(`   ${nestedPath}`);
    console.log(`   للترحيل: SQLITE_PATH=./prisma/prisma/dev.db`);
  }

  if (found.length === 0) {
    console.log("\nلم يُعثر على أي ملف .db في المشروع.");
    console.log("إن كان لديك نسخة احتياطية، ضعها في prisma/dev.db أو عيّن SQLITE_PATH.");
    return;
  }

  console.log(`\nملفات .db (${found.length}):`);
  for (const f of found) {
    const st = statSync(f);
    console.log(`  ${f}  (${st.size} bytes)`);
  }
}

main();
