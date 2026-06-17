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

export const HOME_BANNER_SIZE_HINTS: Record<
  HomeBannerPlacement,
  { size: string; ratio: string; note: string }
> = {
  top_strip: {
    size: "1920 × 280 px",
    ratio: "6.8:1",
    note: "مناسب للبنر العلوي العريض.",
  },
  hero_main: {
    size: "1440 × 630 px",
    ratio: "16:7",
    note: "مناسب للبنر الرئيسي الكبير.",
  },
  side_promo: {
    size: "600 × 270 px",
    ratio: "5:2.25",
    note: "مناسب للبنرات الجانبية الصغيرة.",
  },
  category_icon: {
    size: "400 × 400 px",
    ratio: "1:1",
    note: "مناسب للأيقونات الدائرية؛ يفضّل ترك العنصر في منتصف الصورة.",
  },
};

export function normalizeHomeBannerPlacement(
  value: string | null | undefined,
): HomeBannerPlacement {
  const values = Object.values(HOME_BANNER_PLACEMENTS);
  return values.includes(value as HomeBannerPlacement)
    ? (value as HomeBannerPlacement)
    : HOME_BANNER_PLACEMENTS.HERO_MAIN;
}
