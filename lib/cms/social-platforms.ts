export type SocialPlatformId =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "twitter"
  | "whatsapp"
  | "telegram"
  | "snapchat"
  | "linkedin"
  | "custom";

export type SocialPlatformDef = {
  id: SocialPlatformId;
  labelAr: string;
  defaultUrl: string;
};

export const SOCIAL_PLATFORMS: SocialPlatformDef[] = [
  {
    id: "facebook",
    labelAr: "فيسبوك",
    defaultUrl: "https://www.facebook.com/",
  },
  {
    id: "instagram",
    labelAr: "إنستغرام",
    defaultUrl: "https://www.instagram.com/",
  },
  {
    id: "tiktok",
    labelAr: "تيك توك",
    defaultUrl: "https://www.tiktok.com/",
  },
  {
    id: "youtube",
    labelAr: "يوتيوب",
    defaultUrl: "https://www.youtube.com/",
  },
  {
    id: "twitter",
    labelAr: "X (تويتر)",
    defaultUrl: "https://x.com/",
  },
  {
    id: "whatsapp",
    labelAr: "واتساب",
    defaultUrl: "https://wa.me/",
  },
  {
    id: "telegram",
    labelAr: "تيليجرام",
    defaultUrl: "https://t.me/",
  },
  {
    id: "snapchat",
    labelAr: "سناب شات",
    defaultUrl: "https://www.snapchat.com/",
  },
  {
    id: "linkedin",
    labelAr: "لينكدإن",
    defaultUrl: "https://www.linkedin.com/",
  },
  {
    id: "custom",
    labelAr: "مخصص",
    defaultUrl: "https://",
  },
];

const PLATFORM_SET = new Set(SOCIAL_PLATFORMS.map((p) => p.id));

export function isSocialPlatformId(value: string): value is SocialPlatformId {
  return PLATFORM_SET.has(value as SocialPlatformId);
}

export function getSocialPlatformDef(
  id: string,
): SocialPlatformDef | undefined {
  return SOCIAL_PLATFORMS.find((p) => p.id === id);
}
