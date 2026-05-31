export type FaqContent = {
  title: string;
  items: { q: string; a: string }[];
};

export type HowItWorksContent = {
  title: string;
  steps: { title: string; text: string }[];
};

export type WalletPolicyContent = {
  title: string;
  intro: string;
  options: { title: string; text: string }[];
};

export type SiteSettingsView = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  marqueeEnabled: boolean;
  metaDescription: string;
};

export type MarqueeItemView = {
  id: string;
  text: string;
  sortOrder: number;
  enabled: boolean;
};

export type HomeBannerView = {
  id: string;
  imageUrl: string;
  categorySlug: string | null;
  title: string | null;
  sortOrder: number;
  enabled: boolean;
};

export type HomeSectionView = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
  visible: boolean;
};

export type NavMenuItemView = {
  id: string;
  label: string;
  href: string;
  linkType: string;
  categorySlug: string | null;
  sortOrder: number;
  enabled: boolean;
};

export type ThemeColorsView = {
  brandNavy: string;
  brandGold: string;
  brandGray: string;
  brandWhite: string;
  background: string;
  foreground: string;
};

export type PageBlockView = {
  id: string;
  pageKey: string;
  type: string;
  payload: string;
  sortOrder: number;
  enabled: boolean;
};

export type FooterColumnView = {
  id: string;
  title: string;
  sortOrder: number;
  links: {
    id: string;
    label: string;
    href: string;
    sortOrder: number;
    external: boolean;
  }[];
};
