import {
  getProgressPercent,
  getRemainingQuantity,
} from "@/lib/campaign-config";

type Props = {
  targetQuantity: number;
  reservedQuantity: number;
};

export function QuantityProgress({ targetQuantity, reservedQuantity }: Props) {
  const remaining = getRemainingQuantity(targetQuantity, reservedQuantity);
  const percent = getProgressPercent(targetQuantity, reservedQuantity);

  return (
    <div className="rounded-2xl border border-brand-gray bg-brand-white p-5 shadow-sm sm:p-6">
      <div className="mb-2 flex items-end justify-between gap-2">
        <p className="text-sm font-semibold text-brand-navy">تقدّم الحملة</p>
        <p className="text-2xl font-bold tabular-nums text-brand-gold">
          {remaining}
          <span className="text-sm font-medium text-brand-navy/60">
            {" "}
            قطعة متبقية
          </span>
        </p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-brand-gray">
        <div
          className="h-full rounded-full bg-brand-gold transition-all duration-500"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={reservedQuantity}
          aria-valuemin={0}
          aria-valuemax={targetQuantity}
        />
      </div>
      <p className="mt-2 text-center text-xs text-brand-navy/60">
        تم حجز {reservedQuantity} من {targetQuantity} قطعة ({percent}%)
      </p>
    </div>
  );
}
