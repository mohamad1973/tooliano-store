/** يضيف connection_limit تلقائياً لـ MySQL إن لم يكن موجوداً — يقلّل max_connections على Hostinger */
export function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!raw.startsWith("mysql://")) return raw;
  if (/connection_limit=/i.test(raw)) return raw;

  const limit = process.env.DATABASE_CONNECTION_LIMIT?.trim() || "3";
  const sep = raw.includes("?") ? "&" : "?";
  return `${raw}${sep}connection_limit=${limit}`;
}
