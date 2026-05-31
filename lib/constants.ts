export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Tooliano";
export const DEFAULT_CURRENCY =
  process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "EGP";
export const CURRENCY_LOCALE =
  process.env.NEXT_PUBLIC_CURRENCY_LOCALE ?? "ar-EG";
export const WC_REST_BASE_PATH = "/wp-json/wc/v3";
export const DEFAULT_PER_PAGE = 12;

export const WP_STORE_ORIGIN =
  process.env.NEXT_PUBLIC_WP_STORE_ORIGIN?.replace(/\/$/, "") ??
  "https://tooliano.com";

export const SOCIAL_URLS = {
  facebook:
    process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL?.trim() ||
    "https://www.facebook.com/",
  instagram:
    process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL?.trim() ||
    "https://www.instagram.com/",
  tiktok:
    process.env.NEXT_PUBLIC_SOCIAL_TIKTOK_URL?.trim() ||
    "https://www.tiktok.com/",
  youtube:
    process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL?.trim() ||
    "https://www.youtube.com/",
} as const;

export const WP_WISHLIST_URL =
  process.env.NEXT_PUBLIC_WP_WISHLIST_URL?.trim() ||
  `${WP_STORE_ORIGIN}/wishlist/`;
