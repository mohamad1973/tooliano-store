import { Fragment } from "react";

const PHRASES = [
  "شحن مجانى",
  "توصيل سريع",
  "خدمه ما بعد البيع",
  "افضل مستلزمات البيت الحديث",
] as const;

export function TopMarquee() {
  return (
    <div
      className="overflow-hidden border-b border-brand-gold/40 bg-brand-navy py-2 text-[11px] font-semibold text-brand-gold shadow-inner sm:text-xs"
      dir="ltr"
    >
      <div className="top-marquee-line inline-flex items-center gap-8 whitespace-nowrap px-4 sm:gap-12 sm:px-6">
        {PHRASES.map((text, i) => (
          <Fragment key={text}>
            {i > 0 ? (
              <span className="text-brand-white/50" aria-hidden>
                •
              </span>
            ) : null}
            <span>{text}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
