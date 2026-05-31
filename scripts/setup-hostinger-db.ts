/**
 * إعداد ربط Hostinger MySQL (تفاعلي)
 * الاستخدام: npm run setup:hostinger
 */
import { createInterface } from "readline";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import { loadEnvLocal } from "./lib/load-env-local";

function ask(rl: ReturnType<typeof createInterface>, q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));
}

function upsertEnvLines(
  content: string,
  entries: Record<string, string>,
): string {
  let out = content;
  for (const [key, value] of Object.entries(entries)) {
    const line = `${key}="${value}"`;
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(out)) out = out.replace(re, line);
    else out = `${out.trimEnd()}\n${line}\n`;
  }
  return out;
}

function buildMysqlUrl(input: {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}): string {
  return `mysql://${encodeURIComponent(input.user)}:${encodeURIComponent(input.password)}@${input.host}:${input.port}/${input.database}?connection_limit=5`;
}

async function main() {
  loadEnvLocal();
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ أنشئ .env.local من env.example أولاً");
    process.exit(1);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log("=== إعداد MySQL على Hostinger ===\n");
  console.log("من hPanel → MySQL Databases انسخ MySQL hostname (ليس localhost)");
  console.log("من hPanel → Remote MySQL أضف % ثم Create\n");

  const defaultUser = process.env.MYSQL_USER || "u419683418_mohamad";
  const defaultDb = process.env.MYSQL_DATABASE || "u419683418_tooliano";

  const host =
    process.env.MYSQL_HOST?.trim() ||
    (await ask(rl, `MYSQL_HOST (مثل srv1234.hstgr.io): `));
  const port =
    process.env.MYSQL_PORT?.trim() ||
    (await ask(rl, `MYSQL_PORT [3306]: `)) ||
    "3306";
  const user =
    process.env.MYSQL_USER?.trim() ||
    (await ask(rl, `MYSQL_USER [${defaultUser}]: `)) ||
    defaultUser;
  const database =
    process.env.MYSQL_DATABASE?.trim() ||
    (await ask(rl, `MYSQL_DATABASE [${defaultDb}]: `)) ||
    defaultDb;
  const password =
    process.env.MYSQL_PASSWORD ||
    (await ask(rl, "MYSQL_PASSWORD (لن تُعرض في الشات): "));

  rl.close();

  if (!host || !password) {
    console.error("❌ MYSQL_HOST و MYSQL_PASSWORD مطلوبان");
    process.exit(1);
  }

  const databaseUrl = buildMysqlUrl({ host, port, user, password, database });

  let content = readFileSync(envPath, "utf8");
  content = upsertEnvLines(content, {
    MYSQL_HOST: host,
    MYSQL_PORT: port,
    MYSQL_USER: user,
    MYSQL_DATABASE: database,
    MYSQL_PASSWORD: password,
    DATABASE_URL: databaseUrl,
  });
  writeFileSync(envPath, content, "utf8");

  console.log("\n✅ حُفظت الإعدادات في .env.local");
  console.log("   DATABASE_URL:", databaseUrl.replace(/:([^:@/]+)@/, ":****@"));

  const steps = [
    "db:setup",
    "db:seed",
    "migrate:sqlite-to-db",
    "migrate:vendor-images",
    "extend:campaigns",
    "verify:db",
  ];

  console.log("\n--- تشغيل أوامر الإعداد ---\n");
  for (const step of steps) {
    console.log(`▶ npm run ${step}`);
    try {
      execSync(`npm run ${step}`, {
        stdio: "inherit",
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
    } catch {
      console.error(`\n❌ فشل: npm run ${step}`);
      console.error("   راجع Remote MySQL (%) وصحة hostname");
      process.exit(1);
    }
  }

  console.log("\n✅ اكتمل الإعداد المحلي.");
  console.log("   انسخ DATABASE_URL إلى Vercel → Environment Variables ثم Redeploy.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
