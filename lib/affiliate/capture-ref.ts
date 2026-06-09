import {
  AFFILIATE_REF_COOKIE,
  AFFILIATE_REF_MAX_AGE_DAYS,
} from "@/lib/affiliate/constants";

export function affiliateRefCookieOptions() {
  const maxAge = AFFILIATE_REF_MAX_AGE_DAYS * 24 * 60 * 60;
  return {
    name: AFFILIATE_REF_COOKIE,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function normalizeReferralCode(code: string | null | undefined): string | null {
  const normalized = code?.trim().toUpperCase();
  return normalized && /^[A-Z0-9]{4,16}$/.test(normalized) ? normalized : null;
}
