import {
  getProgressPercent,
  getRemainingQuantity,
} from "@/lib/campaign-config";

type Props = {
  targetQuantity: number;
  reservedQuantity: number;
  compact?: boolean;
};

export function QuantityProgress({
  targetQuantity,
  reservedQuantity,
  compact = false,
}: Props) {
  const remaining = getRemainingQuantity(targetQuantity, reservedQuantity);
  const percent = getProgressPercent(targetQuantity, reservedQuantity);

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-brand-gray bg-brand-white p-3 shadow-sm"
          : "rounded-2xl border border-brand-gray bg-brand-white p-5 shadow-sm sm:p-6"
      }
    >
      <div className="mb-2 flex items-end justify-between gap-2">
        <p
          className={
            compact
              ? "text-xs font-semibold text-brand-navy"
              : "text-sm font-semibold text-brand-navy"
          }
        >
          تقدّم الحملة
        </p>
        <p
          className={
            compact
              ? "text-xl font-bold tabular-nums text-brand-gold"
              : "text-2xl font-bold tabular-nums text-brand-gold"
          }
        >
          {remaining}
          <span
            className={
              compact
                ? "text-xs font-medium text-brand-navy/60"
                : "text-sm font-medium text-brand-navy/60"
            }
          >
            {" "}
            قطعة متبقية
          </span>
        </p>
      </div>
      <div
        className={
          compact
            ? "h-2 overflow-hidden rounded-full bg-brand-gray"
            : "h-3 overflow-hidden rounded-full bg-brand-gray"
        }
      >
        <div
          className="h-full rounded-full bg-brand-gold transition-all duration-500"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={reservedQuantity}
          aria-valuemin={0}
          aria-valuemax={targetQuantity}
        />
      </div>
      <p
        className={
          compact
            ? "mt-1.5 text-center text-[10px] text-brand-navy/60"
            : "mt-2 text-center text-xs text-brand-navy/60"
        }
      >
        تم حجز {reservedQuantity} من {targetQuantity} قطعة ({percent}%)
      </p>
    </div>
  );
}
