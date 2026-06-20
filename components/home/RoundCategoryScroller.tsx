import Link from "next/link";

type CategoryIcon = {
  id: string;
  imageUrl: string;
  href: string;
  label: string;
  altText: string;
};

type Props = {
  items: CategoryIcon[];
};

export function RoundCategoryScroller({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section
      className="border-b border-brand-gray bg-brand-white px-3 py-5 sm:px-4"
      aria-label="مجموعات المتجر"
    >
      <div className="mx-auto max-w-6xl overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
        <ul className="flex min-w-max items-start gap-4 sm:justify-between sm:gap-5">
          {items.map((item) => (
            <li key={item.id} className="w-16 shrink-0 sm:w-20">
              <Link href={item.href} className="group block text-center">
                <span className="relative mx-auto block h-14 w-14 overflow-hidden rounded-full border border-brand-gray bg-brand-gray/40 shadow-sm transition group-hover:border-brand-gold sm:h-16 sm:w-16">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.altText}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="mt-2 line-clamp-2 block min-h-[2rem] text-[11px] font-medium leading-snug text-brand-navy/80 group-hover:text-brand-gold sm:text-xs">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
