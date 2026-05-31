export const PAGE_KEYS = {
  HOME: "home",
} as const;

export const PAGE_BLOCK_TYPES = {
  HERO: "hero",
  RICH_TEXT: "richText",
  CTA: "cta",
  IMAGE_ROW: "imageRow",
} as const;

export type HeroBlockPayload = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonHref: string;
};

export type RichTextBlockPayload = {
  html: string;
};

export type CtaBlockPayload = {
  title: string;
  buttonLabel: string;
  buttonHref: string;
};

export type ImageRowBlockPayload = {
  images: { url: string; alt: string; href?: string }[];
};

export type PageBlockPayload =
  | HeroBlockPayload
  | RichTextBlockPayload
  | CtaBlockPayload
  | ImageRowBlockPayload;

export function parsePageBlockPayload<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const DEFAULT_HERO_BLOCK: HeroBlockPayload = {
  title: "عروض شراء جماعي",
  subtitle: "وفّر أكثر عند الشراء معاً",
  buttonLabel: "تصفّح الفرص",
  buttonHref: "/campaign",
};
