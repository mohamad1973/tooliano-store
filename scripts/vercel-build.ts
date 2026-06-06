/**
 * بناء الإنتاج — يعمل على Vercel (process.env) ومحلياً (.env.local)
 */
import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env-local";

loadEnvLocal();

const env = { ...process.env };

if (!env.DATABASE_URL?.trim()) {
  console.error("❌ DATABASE_URL غير مضبوط.");
  console.error("   محلياً: .env.local | Vercel: Environment Variables");
  process.exit(1);
}

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit", env, cwd: process.cwd() });
}

console.log("▶ prisma generate");
run("npx prisma generate");

const onVercel = Boolean(process.env.VERCEL);
const pushSchema =
  process.env.VERCEL_DB_PUSH === "1" ||
  (!onVercel && process.env.SKIP_DB_PUSH !== "1");

if (pushSchema) {
  console.log("▶ prisma db push");
  run("npx prisma db push");
} else {
  console.log(
    "▶ skip prisma db push (Vercel — schema unchanged; set VERCEL_DB_PUSH=1 to force)",
  );
}

console.log("▶ next build");
run("npx next build");

console.log("\n✅ vercel-build اكتمل");
