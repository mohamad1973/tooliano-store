"use client";

type Props = {
  groupPriceLabel: string;
};

export function StickyReserveBar({ groupPriceLabel }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-gray bg-brand-white/95 p-3 shadow-[0_-4px_24px_rgba(20,33,61,0.12)] backdrop-blur md:hidden">
      <a
        href="#reserve"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-navy"
      >
        احجز الآن — من {groupPriceLabel}
      </a>
    </div>
  );
}
