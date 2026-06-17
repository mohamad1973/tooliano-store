export const HOME_BANNER_PLACEMENTS = {
  TOP_STRIP: "top_strip",
  HERO_MAIN: "hero_main",
  SIDE_PROMO: "side_promo",
  CATEGORY_ICON: "category_icon",
} as const;

export type HomeBannerPlacement =
  (typeof HOME_BANNER_PLACEMENTS)[keyof typeof HOME_BANNER_PLACEMENTS];

export const HOME_BANNER_PLACEMENT_LABELS: Record<HomeBannerPlacement, string> =
  {
    top_strip: "بنر علوي عريض",
    hero_main: "بنر رئيسي كبير",
    side_promo: "بنر جانبي صغير",
    category_icon: "أيقونة تصنيف دائرية",
  };

export function normalizeHomeBannerPlacement(
  value: string | null | undefined,
): HomeBannerPlacement {
  const values = Object.values(HOME_BANNER_PLACEMENTS);
  return values.includes(value as HomeBannerPlacement)
    ? (value as HomeBannerPlacement)
    : HOME_BANNER_PLACEMENTS.HERO_MAIN;
}
