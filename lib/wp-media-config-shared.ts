export type WpMediaCredentials = {
  baseURL: string;
  user: string;
  appPassword: string;
};

/** يزيل المسافات من Application Password (WordPress يعرضها بمسافات) */
export function normalizeWpAppPassword(raw: string | undefined): string {
  return (raw ?? "").replace(/\s+/g, "").trim();
}

/** يدعم WP_URL أو WC_BASE_URL (مع https:// إن لزم) */
export function resolveWordPressBaseUrl(): string {
  const raw =
    process.env.WP_URL?.trim() ||
    process.env.WC_BASE_URL?.trim() ||
    "";
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }
  return `https://${raw.replace(/\/$/, "")}`;
}

/** WP_USERNAME أو WP_MEDIA_USER / WP_MEDIA_USERNAME */
export function resolveWordPressMediaUsername(): string {
  return (
    process.env.WP_USERNAME?.trim() ||
    process.env.WP_MEDIA_USER?.trim() ||
    process.env.WP_MEDIA_USERNAME?.trim() ||
    ""
  );
}

export function getWpMediaCredentials(): WpMediaCredentials | null {
  const baseURL = resolveWordPressBaseUrl();
  const user = resolveWordPressMediaUsername();
  const appPassword = normalizeWpAppPassword(process.env.WP_APP_PASSWORD);

  if (!baseURL || !user || !appPassword) return null;

  return { baseURL, user, appPassword };
}

export function isWordPressMediaUploadConfigured(): boolean {
  return getWpMediaCredentials() !== null;
}
