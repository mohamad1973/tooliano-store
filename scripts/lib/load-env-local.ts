import { existsSync, readFileSync } from "fs";
import path from "path";

/** يحمّل .env.local إلى process.env (بدون استبدال قيم موجودة مسبقاً) */
export function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

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

export function requireEnv(name: string): string {
  const val = process.env[name]?.trim();
  if (!val) {
    throw new Error(`المتغير ${name} غير مضبوط — راجع .env.local أو docs/DEPLOY-VERCEL.md`);
  }
  return val;
}
