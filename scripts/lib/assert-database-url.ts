/** يتحقق أن DATABASE_URL يشير لقاعدة إنتاج (MySQL أو Postgres) وليس SQLite محلي */
export function assertProductionDatabaseUrl(url: string): void {
  if (url.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL يشير لـ SQLite — استخدم mysql:// (Hostinger) أو postgresql:// (Neon) للهدف.",
    );
  }
  const ok =
    url.startsWith("mysql://") ||
    url.startsWith("postgresql://") ||
    url.startsWith("postgres://");
  if (!ok) {
    throw new Error(
      "DATABASE_URL غير معروف — استخدم mysql:// أو postgresql:// — راجع docs/DEPLOY-HOSTINGER-MYSQL.md",
    );
  }
}

export function databaseKind(url: string): "mysql" | "postgres" | "other" {
  if (url.startsWith("mysql://")) return "mysql";
  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    return "postgres";
  }
  return "other";
}
