import { getHomeBannersResolved } from "@/lib/cms/get-site-content";
import { HOME_BANNER_PLACEMENTS } from "@/lib/cms/home-banner-layout";
import { HomeHeroPromos } from "@/components/home/HomeHeroPromos";
import { RoundCategoryScroller } from "@/components/home/RoundCategoryScroller";

export async function CategoryBanners() {
  let banners: Awaited<ReturnType<typeof getHomeBannersResolved>> = [];
  try {
    banners = await getHomeBannersResolved();
  } catch {
    return null;
  }

  if (banners.length === 0) return null;

  const topStrip = banners.find(
    (banner) => banner.placement === HOME_BANNER_PLACEMENTS.TOP_STRIP,
  );
  const mainBanner =
    banners.find(
      (banner) => banner.placement === HOME_BANNER_PLACEMENTS.HERO_MAIN,
    ) ?? banners[0];
  const sidePromos = banners.filter(
    (banner) => banner.placement === HOME_BANNER_PLACEMENTS.SIDE_PROMO,
  );
  const categoryIcons = banners.filter(
    (banner) => banner.placement === HOME_BANNER_PLACEMENTS.CATEGORY_ICON,
  );

  return (
    <>
      <HomeHeroPromos
        topStrip={topStrip}
        mainBanner={mainBanner}
        sidePromos={sidePromos}
      />
      <RoundCategoryScroller items={categoryIcons} />
    </>
  );
}
