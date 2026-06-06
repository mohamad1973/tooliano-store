/**
 * يبني DATABASE_URL من MYSQL_HOST / MYSQL_USER / MYSQL_PASSWORD / MYSQL_DATABASE
 * ويحدّث سطر DATABASE_URL في .env.local
 * الاستخدام: npm run env:sync-db-url
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { loadEnvLocal } from "./lib/load-env-local";

function buildMysqlUrl(input: {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}): string {
  const encUser = encodeURIComponent(input.user);
  const encPass = encodeURIComponent(input.password);
  const port = input.port || "3306";
  return `mysql://${encUser}:${encPass}@${input.host}:${port}/${input.database}?connection_limit=3`;
}

function upsertEnvLine(content: string, key: string, value: string): string {
  const line = `${key}="${value}"`;
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    return content.replace(re, line);
  }
  return `${content.trimEnd()}\n${line}\n`;
}

function main() {
  loadEnvLocal();

  const host = process.env.MYSQL_HOST?.trim();
  const user = process.env.MYSQL_USER?.trim();
  const password = process.env.MYSQL_PASSWORD ?? "";
  const database = process.env.MYSQL_DATABASE?.trim();
  const port = process.env.MYSQL_PORT?.trim() || "3306";

  if (!host || !user || !database) {
    console.error("❌ املأ في .env.local:");
    console.error("   MYSQL_HOST=   (من hPanel → MySQL Databases)");
    console.error("   MYSQL_USER=   (مثل u419683418_mohamad)");
    console.error("   MYSQL_DATABASE= (مثل u419683418_tooliano)");
    console.error("   MYSQL_PASSWORD=");
    process.exit(1);
  }

  if (!password) {
    console.error("❌ MYSQL_PASSWORD فارغ في .env.local");
    process.exit(1);
  }

  const url = buildMysqlUrl({ host, port, user, password, database });
  const envPath = path.join(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    console.error("❌ لم يُعثر على .env.local");
    process.exit(1);
  }

  let content = readFileSync(envPath, "utf8");
  content = upsertEnvLine(content, "DATABASE_URL", url);
  writeFileSync(envPath, content, "utf8");

  const masked = url.replace(/:([^:@/]+)@/, ":****@");
  console.log("✅ تم تحديث DATABASE_URL في .env.local");
  console.log(`   ${masked}`);
  console.log("\nالخطوة التالية: npm run db:setup");
}

main();
