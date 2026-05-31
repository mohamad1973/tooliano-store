import { Fragment } from "react";
import { getMarqueeItems } from "@/lib/cms/get-site-content";

export async function TopMarquee() {
  const items = await getMarqueeItems();
  if (items.length === 0) return null;

  return (
    <div
      className="overflow-hidden border-b border-brand-gold/40 bg-brand-navy py-2 text-[11px] font-semibold text-brand-gold shadow-inner sm:text-xs"
      dir="ltr"
    >
      <div className="top-marquee-line inline-flex items-center gap-8 whitespace-nowrap px-4 sm:gap-12 sm:px-6">
        {items.map((item, i) => (
          <Fragment key={item.id}>
            {i > 0 ? (
              <span className="text-brand-white/50" aria-hidden>
                •
              </span>
            ) : null}
            <span>{item.text}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
