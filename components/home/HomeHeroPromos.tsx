import Link from "next/link";

type Banner = {
  id: string;
  imageUrl: string;
  href: string;
  label: string;
  altText: string;
};

type Props = {
  topStrip?: Banner;
  mainBanner?: Banner;
  sidePromos: Banner[];
};

function PromoLink({
  banner,
  className,
  imageClassName = "",
}: {
  banner: Banner;
  className: string;
  imageClassName?: string;
}) {
  return (
    <Link
      href={banner.href}
      className={`group relative block overflow-hidden rounded-sm bg-brand-gray shadow-sm ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.imageUrl}
        alt={banner.altText}
        className={`absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] ${imageClassName}`}
      />
      <span className="sr-only">{banner.label}</span>
    </Link>
  );
}

export function HomeHeroPromos({ topStrip, mainBanner, sidePromos }: Props) {
  if (!topStrip && !mainBanner && sidePromos.length === 0) return null;

  return (
    <section className="bg-brand-white px-3 pt-4 sm:px-4" aria-label="عروض مميزة">
      <div className="mx-auto max-w-6xl space-y-3">
        {topStrip ? (
          <PromoLink
            banner={topStrip}
            className="aspect-[8/1.15] min-h-[58px] w-full sm:min-h-[78px]"
          />
        ) : null}

        {mainBanner || sidePromos.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-[1fr_2.2fr]">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {sidePromos.slice(0, 2).map((banner, index) => (
                <PromoLink
                  key={banner.id}
                  banner={banner}
                  className="aspect-[4/3] lg:aspect-[5/2.25]"
                />
              ))}
            </div>

            {mainBanner ? (
              <PromoLink
                banner={mainBanner}
                className="aspect-[16/7] min-h-[180px] lg:min-h-[245px]"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
