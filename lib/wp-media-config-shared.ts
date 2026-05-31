export type WpMediaCredentials = {
  baseURL: string;
  user: string;
  appPassword: string;
};

/** يزيل المسافات من Application Password (WordPress يعرضها بمسافات) */
export function normalizeWpAppPassword(raw: string | undefined): string {
  return (raw ?? "").replace(/\s+/g, "").trim();
}

export function getWpMediaCredentials(): WpMediaCredentials | null {
  const baseURL = process.env.WC_BASE_URL?.replace(/\/$/, "") ?? "";
  const user = (
    process.env.WP_MEDIA_USER ?? process.env.WP_MEDIA_USERNAME ?? ""
  ).trim();
  const appPassword = normalizeWpAppPassword(process.env.WP_APP_PASSWORD);

  if (!baseURL || !user || !appPassword) return null;

  return { baseURL, user, appPassword };
}

export function isWordPressMediaUploadConfigured(): boolean {
  return getWpMediaCredentials() !== null;
}
